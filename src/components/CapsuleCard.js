"use client";

import Link from "next/link";
import { LockKeyhole, Mail, UnlockKeyhole } from "lucide-react";
import { formatDateTime, isUnlocked } from "@/lib/time";

export function CapsuleCard({ capsule }) {
  const unlocked = isUnlocked(capsule.unlock_date);

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="glass-soft reveal-card group flex min-h-44 flex-col justify-between rounded-xl p-5 transition hover:-translate-y-1 hover:border-amber-200/35 hover:bg-white/10"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <h2 className="line-clamp-2 text-lg font-semibold text-white">
            {capsule.title}
          </h2>
          <div
            className={`rounded-lg p-2 ${
              unlocked
                ? "bg-emerald-400/12 text-emerald-200"
                : "bg-amber-300/12 text-amber-200"
            }`}
          >
            {unlocked ? (
              <UnlockKeyhole className="h-5 w-5" aria-hidden="true" />
            ) : (
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {unlocked
            ? "Нээж уншихад бэлэн."
            : `Нээгдэх огноо: ${formatDateTime(capsule.unlock_date)}`}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>{capsule.is_public ? "Нийтийн capsule" : "Хувийн capsule"}</span>
        {capsule.recipient_email ? (
          <span className="inline-flex items-center gap-1 truncate">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {capsule.recipient_email}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
