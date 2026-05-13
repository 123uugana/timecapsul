"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clapperboard, RefreshCw, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { getSupabase } from "@/lib/supabase";

const emptyState = {
  cinematic_narration: "",
  emotional_rewrite: "",
  share_card_text: "",
};

export function AIMemoryExperience({ capsuleId, unlocked }) {
  const [experience, setExperience] = useState(emptyState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const hasAutoLoaded = useRef(false);

  async function loadExperience() {
    if (!unlocked || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setPaymentRequired(false);

    const supabase = getSupabase();
    const { data: sessionData } = supabase
      ? await supabase.auth.getSession()
      : { data: { session: null } };

    const response = await fetch(`/api/capsules/${capsuleId}/memory-experience`, {
      method: "POST",
      headers: sessionData.session?.access_token
        ? { Authorization: `Bearer ${sessionData.session.access_token}` }
        : undefined,
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "AI Memory Experience үүсгэхэд алдаа гарлаа.");
      setPaymentRequired(Boolean(payload.paymentRequired));
      setLoading(false);
      return;
    }

    setExperience(payload.experience || emptyState);
    setLoading(false);
  }

  useEffect(() => {
    if (!unlocked || hasAutoLoaded.current) {
      return;
    }

    hasAutoLoaded.current = true;
    const timer = window.setTimeout(() => {
      loadExperience();
    }, 0);

    return () => window.clearTimeout(timer);
    // loadExperience intentionally stays local to avoid refetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, capsuleId]);

  return (
    <section className="ai-memory-panel reveal-up mt-8 rounded-2xl p-6 text-left sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">
            AI Memory Experience
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Нээгдсэн дурсамжид нэмэх cinematic давхарга.
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={loadExperience}
          disabled={!unlocked || loading}
          className="shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {loading ? "Үүсгэж байна..." : "Дахин үүсгэх"}
        </Button>
      </div>

      {!unlocked ? (
        <div className="mt-6 rounded-xl border border-amber-200/18 bg-amber-200/8 p-5 text-sm leading-6 text-amber-50">
          Энэ experience capsule нээгдэх үед идэвхжинэ.
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-rose-300/18 bg-rose-300/8 p-5 text-sm leading-6 text-rose-100">
          <p>{error}</p>
          {paymentRequired ? (
            <Link
              href="/pricing"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              3,000₮ reveal эрх авах
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          <MemoryBlock
            icon={Clapperboard}
            title="Cinematic narration текст"
            text={experience.cinematic_narration}
            loading={loading}
          />
          <MemoryBlock
            icon={Sparkles}
            title="Сэтгэл хөдлөлтэй rewrite"
            text={experience.emotional_rewrite}
            loading={loading}
          />
          <MemoryBlock
            icon={Share2}
            title="Social share card text"
            text={experience.share_card_text}
            loading={loading}
            compact
          />
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Энэ нь text-only MVP output. Backend route нь дараа жинхэнэ AI text
        provider залгахад бэлэн, voice/video одоогоор зориуд холбогдоогүй.
      </p>
    </section>
  );
}

function MemoryBlock({ icon: Icon, title, text, loading, compact = false }) {
  return (
    <article className="glass-soft rounded-xl p-5">
      <div className="mb-3 flex items-center gap-2 text-amber-200">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
          {title}
        </h3>
      </div>
      {loading && !text ? (
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
        </div>
      ) : (
        <p
          className={`whitespace-pre-wrap text-slate-100 ${
            compact ? "text-base font-medium" : "text-sm leading-7"
          }`}
        >
          {text || "Memory layer бэлдэж байна..."}
        </p>
      )}
    </article>
  );
}
