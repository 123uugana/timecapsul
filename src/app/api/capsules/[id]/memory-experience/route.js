import { NextResponse } from "next/server";
import { generateMemoryExperience } from "@/lib/memoryExperience";
import { isPremiumProfile } from "@/lib/pricing";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@/lib/supabaseServer";

function getAccessToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(getAccessToken(request));

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase env тохиргоо дутуу байна." },
      { status: 500 },
    );
  }

  const { data: capsule, error: capsuleError } = await supabase
    .from("capsules")
    .select("id,title,unlock_date,is_public")
    .eq("id", id)
    .single();

  if (capsuleError || !capsule) {
    return NextResponse.json(
      { error: capsuleError?.message || "Capsule олдсонгүй." },
      { status: 404 },
    );
  }

  if (new Date(capsule.unlock_date).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "AI Memory Experience нь capsule нээгдсэний дараа боломжтой." },
      { status: 423 },
    );
  }

  const { data: cached, error: cacheError } = await supabase
    .from("ai_memory_experiences")
    .select(
      "cinematic_narration,emotional_rewrite,share_card_text,provider,model,generated_at",
    )
    .eq("capsule_id", id)
    .maybeSingle();

  if (cacheError) {
    return NextResponse.json({ error: cacheError.message }, { status: 500 });
  }

  if (cached) {
    return NextResponse.json({ experience: cached, cached: true });
  }

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return NextResponse.json(
      {
        error: "AI Cinematic Reveal үүсгэхийн тулд нэвтэрч төлбөрийн эрх авна уу.",
        paymentRequired: true,
      },
      { status: 402 },
    );
  }

  const serviceSupabase = getSupabaseServiceClient();

  if (!serviceSupabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY тохируулагдаагүй байна." },
      { status: 500 },
    );
  }

  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();
  const hasRevealCredit = (profile?.ai_reveal_credits || 0) > 0;
  const hasPremium = isPremiumProfile(profile);

  if (!hasPremium && !hasRevealCredit) {
    return NextResponse.json(
      {
        error:
          "AI Cinematic Reveal нь 3,000₮ one-time эрх эсвэл Premium эрх шаарддаг.",
        paymentRequired: true,
      },
      { status: 402 },
    );
  }

  const { data: message, error: messageError } = await supabase.rpc(
    "get_unlocked_capsule_message",
    { capsule_id: id },
  );

  if (messageError || !message) {
    return NextResponse.json(
      {
        error:
          messageError?.message ||
          "Энэ мессеж одоогоор энэ viewer-д боломжгүй байна.",
      },
      { status: 403 },
    );
  }

  const generated = generateMemoryExperience({
    title: capsule.title,
    message,
    unlockDate: capsule.unlock_date,
  });

  const { data: inserted, error: insertError } = await supabase
    .from("ai_memory_experiences")
    .insert({
      capsule_id: id,
      ...generated,
    })
    .select(
      "cinematic_narration,emotional_rewrite,share_card_text,provider,model,generated_at",
    )
    .single();

  if (insertError) {
    const { data: racedCache } = await supabase
      .from("ai_memory_experiences")
      .select(
        "cinematic_narration,emotional_rewrite,share_card_text,provider,model,generated_at",
      )
      .eq("capsule_id", id)
      .maybeSingle();

    if (racedCache) {
      return NextResponse.json({ experience: racedCache, cached: true });
    }

    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (!hasPremium && hasRevealCredit) {
    await serviceSupabase
      .from("profiles")
      .update({
        ai_reveal_credits: Math.max(
          (profile?.ai_reveal_credits || 1) - 1,
          0,
        ),
      })
      .eq("id", authData.user.id);
  }

  return NextResponse.json({ experience: inserted, cached: false });
}
