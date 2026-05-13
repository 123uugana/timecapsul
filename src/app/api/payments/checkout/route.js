import { NextResponse } from "next/server";
import { getPaidProduct, PAYMENT_CURRENCY } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

function getBaseUrl(request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000"
  );
}

function getAccessToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7);
}

export async function POST(request) {
  const { productId } = await request.json();
  const product = getPaidProduct(productId);

  if (!product) {
    return NextResponse.json(
      { error: "Төлбөрийн бүтээгдэхүүн олдсонгүй." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient(getAccessToken(request));
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!authData.user) {
    return NextResponse.json(
      { error: "Төлбөр хийхийн тулд эхлээд нэвтэрнэ үү." },
      { status: 401 },
    );
  }

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe тохиргоо хийгдээгүй байна. STRIPE_SECRET_KEY нэмэх эсвэл QPay provider залгана уу.",
        provider: "qpay-ready",
      },
      { status: 503 },
    );
  }

  const baseUrl = getBaseUrl(request);
  const mode = product.interval ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    mode,
    customer_email: authData.user.email,
    line_items: [
      {
        price_data: {
          currency: PAYMENT_CURRENCY, // Stripe currency is set to "mnt" here for Mongolian Tugrik payments.
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.stripeUnitAmount,
          recurring: product.interval
            ? {
                interval: product.interval,
              }
            : undefined,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: authData.user.id,
      product_id: product.id,
      amount_mnt: String(product.amountMnt),
    },
    success_url: `${baseUrl}/pricing?payment=success`,
    cancel_url: `${baseUrl}/pricing?payment=cancelled`,
  });

  // QPay integration can be added later by replacing the Stripe session creation above
  // with a QPay invoice request while keeping this route response shape: { url }.
  return NextResponse.json({ url: session.url, provider: "stripe" });
}
