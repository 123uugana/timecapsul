"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, UnlockKeyhole } from "lucide-react";
import { AIMemoryExperience } from "@/components/AIMemoryExperience";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { AuthNotice } from "@/components/AuthNotice";
import { Countdown } from "@/components/Countdown";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDateTime, isUnlocked } from "@/lib/time";

export default function UnlockClient({ capsuleId }) {
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
  }, [capsuleId]);

  const unlocked = capsule ? isUnlocked(capsule.unlock_date) : false;

  return (
    <main className="app-background relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <Link
          href={capsule ? `/capsules/${capsule.id}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Буцах
        </Link>

        {!isSupabaseConfigured() ? (
          <div className="mt-8">
            <AuthNotice />
          </div>
        ) : null}

        {loading ? (
          <div className="glass mt-8 h-96 animate-pulse rounded-2xl" />
        ) : error || !capsule ? (
          <section className="glass mt-8 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">
              Capsule боломжгүй байна
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {error || "Энэ capsule олдсонгүй эсвэл private байна."}
            </p>
          </section>
        ) : (
          <section className="glass reveal-up mt-8 rounded-2xl p-6 text-center sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/8 text-amber-200">
              {unlocked ? (
                <UnlockKeyhole className="h-9 w-9" aria-hidden="true" />
              ) : (
                <LockKeyhole className="h-9 w-9" aria-hidden="true" />
              )}
            </div>

            <p className="mt-6 text-sm uppercase tracking-[0.28em] text-amber-200/80">
              {unlocked ? "Нээгдэх өдөр ирлээ" : "Одоогоор битүүмжилсэн"}
            </p>
            <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold text-white">
              {capsule.title}
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Нээгдэх огноо: {formatDateTime(capsule.unlock_date)}
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <Countdown unlockDate={capsule.unlock_date} />
            </div>

            <div className="relative mx-auto mt-8 max-w-2xl rounded-xl border border-white/10 bg-black/22 p-6 text-left">
              {!unlocked ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-zinc-950/38">
                  <div className="rounded-lg bg-black/45 px-4 py-3 text-sm font-medium text-amber-100">
                    Countdown дуусах үед дахин ирээрэй
                  </div>
                </div>
              ) : null}
              <p
                className={`whitespace-pre-wrap text-base leading-8 text-slate-100 ${
                  unlocked ? "" : "locked-message"
                }`}
              >
                {capsule.message ||
                  "Энэ мессеж сонгосон нээгдэх өдөр хүртэл capsule дотор битүүмжилсэн байна."}
              </p>
            </div>

            <AIMemoryExperience capsuleId={capsule.id} unlocked={unlocked} />
          </section>
        )}
      </div>
    </main>
  );
}
