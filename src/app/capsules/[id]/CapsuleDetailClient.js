"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  LockKeyhole,
  Mail,
  UnlockKeyhole,
} from "lucide-react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { AuthNotice } from "@/components/AuthNotice";
import { Countdown } from "@/components/Countdown";
import { ShareCapsuleButton } from "@/components/ShareCapsuleButton";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDateTime, isUnlocked } from "@/lib/time";

export default function CapsuleDetailClient({ capsuleId }) {
  const router = useRouter();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCapsule() {
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { data, error: capsuleError } = await supabase
        .from("capsules")
        .select("id,user_id,title,unlock_date,is_public,recipient_email,created_at")
        .eq("id", capsuleId)
        .single();

      if (capsuleError) {
        setError(capsuleError.message);
      } else {
        if (isUnlocked(data.unlock_date)) {
          const { data: messageData, error: messageError } = await supabase.rpc(
            "get_unlocked_capsule_message",
            { capsule_id: capsuleId },
          );

          if (messageError) {
            setError(messageError.message);
          } else {
            setCapsule({ ...data, message: messageData });
          }
        } else {
          setCapsule({ ...data, message: null });
        }
      }

      setLoading(false);
    }

    loadCapsule();
  }, [capsuleId, router]);

  const unlocked = capsule ? isUnlocked(capsule.unlock_date) : false;

  return (
    <main className="app-background relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        {!isSupabaseConfigured() ? (
          <div className="mt-8">
            <AuthNotice />
          </div>
        ) : null}

        {loading ? (
          <div className="glass mt-8 h-96 animate-pulse rounded-2xl" />
        ) : error || !capsule ? (
          <section className="glass mt-8 rounded-2xl p-8">
            <h1 className="text-2xl font-semibold text-white">
              Capsule боломжгүй байна
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {error || "Энэ capsule олдсонгүй."}
            </p>
          </section>
        ) : (
          <section className="glass reveal-up mt-8 overflow-hidden rounded-2xl">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="capsule-shell flex min-h-80 items-center justify-center border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
                <div className="floating-capsule relative h-64 w-40 rounded-full border border-white/20 bg-black/22 shadow-2xl shadow-black/50">
                  <div className="absolute inset-x-8 top-10 h-24 rounded-full bg-white/15 blur-sm" />
                  <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-zinc-950/45 text-amber-100">
                    {unlocked ? (
                      <UnlockKeyhole className="h-9 w-9" aria-hidden="true" />
                    ) : (
                      <LockKeyhole className="h-9 w-9" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </aside>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>{capsule.is_public ? "Public" : "Private"}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-500" />
                  <span>{unlocked ? "Нээгдсэн" : "Түгжээтэй"}</span>
                </div>

                <h1 className="mt-4 text-4xl font-semibold text-white">
                  {capsule.title}
                </h1>

                <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="glass-soft rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      Нээгдэх огноо
                    </div>
                    <p className="mt-2 text-white">
                      {formatDateTime(capsule.unlock_date)}
                    </p>
                  </div>
                  <div className="glass-soft rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Хүлээн авагч
                    </div>
                    <p className="mt-2 truncate text-white">
                      {capsule.recipient_email || "Ирээдүйн өөртөө"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Countdown unlockDate={capsule.unlock_date} />
                </div>

                <div className="relative mt-6 rounded-xl border border-white/10 bg-black/22 p-5">
                  {!unlocked ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-zinc-950/34">
                      <div className="rounded-lg bg-black/45 px-4 py-3 text-sm font-medium text-amber-100">
                        Нээгдэх өдөр хүртэл түгжээтэй
                      </div>
                    </div>
                  ) : null}
                  <p
                    className={`whitespace-pre-wrap text-sm leading-7 text-slate-100 ${
                      unlocked ? "" : "locked-message"
                    }`}
                  >
                    {capsule.message ||
                      "Энэ мессеж сонгосон нээгдэх өдөр хүртэл capsule дотор битүүмжилсэн байна."}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/capsules/${capsule.id}/unlock`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
                  >
                    {unlocked ? (
                      <UnlockKeyhole className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                    )}
                    Нээх хуудас
                  </Link>
                  <ShareCapsuleButton
                    capsuleId={capsule.id}
                    isPublic={capsule.is_public}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
