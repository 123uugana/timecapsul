import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabaseServer";

export async function POST(request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook тохиргоо дутуу байна." },
      { status: 400 },
    );
  }

  const body = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const productId = session.metadata?.product_id;
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY тохируулагдаагүй байна." },
        { status: 500 },
      );
    }

    if (userId && productId === "premium_monthly") {
      const premiumUntil = new Date();
      premiumUntil.setMonth(premiumUntil.getMonth() + 1);

      await supabase
        .from("profiles")
        .update({
          plan: "premium",
          premium_until: premiumUntil.toISOString(),
        })
        .eq("id", userId);
    }

    if (userId && productId === "ai_cinematic_reveal") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("ai_reveal_credits")
        .eq("id", userId)
        .maybeSingle();

      await supabase
        .from("profiles")
        .update({
          ai_reveal_credits: (profile?.ai_reveal_credits || 0) + 1,
        })
        .eq("id", userId);
    }
  }

  // QPay integration can be added later with a separate webhook/callback handler here.
  return NextResponse.json({ received: true });
}
