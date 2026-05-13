import { NextResponse } from "next/server";
import { getNotificationEmail, sendUnlockEmail } from "@/lib/notifications";
import { getSupabaseServiceClient } from "@/lib/supabaseServer";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function getBaseUrl(request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000"
  );
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Cron secret буруу байна." },
      { status: 401 },
    );
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY тохируулагдаагүй байна." },
      { status: 500 },
    );
  }

  const { data: capsules, error } = await supabase
    .from("capsules")
    .select("id,user_id,title,unlock_date,recipient_email,notification_email,notified_at")
    .lte("unlock_date", new Date().toISOString())
    .is("notified_at", null)
    .order("unlock_date", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = getBaseUrl(request);
  const sent = [];
  const skipped = [];

  for (const capsule of capsules || []) {
    const to = getNotificationEmail(capsule);

    if (!to) {
      skipped.push({ id: capsule.id, reason: "notification email алга" });
      continue;
    }

    const unlockUrl = `${baseUrl}/capsules/${capsule.id}/unlock`;
    const result = await sendUnlockEmail({ to, capsule, unlockUrl });

    if (!result.ok) {
      skipped.push({ id: capsule.id, to, reason: result.reason });
      continue;
    }

    await supabase
      .from("capsules")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", capsule.id);

    sent.push({ id: capsule.id, to });
  }

  return NextResponse.json({
    checked: capsules?.length || 0,
    sent,
    skipped,
  });
}
