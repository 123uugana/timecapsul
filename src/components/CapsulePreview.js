"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { getTimeParts } from "@/lib/time";

const mongolianMonths = [
  "нэгдүгээр сар",
  "хоёрдугаар сар",
  "гуравдугаар сар",
  "дөрөвдүгээр сар",
  "тавдугаар сар",
  "зургаадугаар сар",
  "долоодугаар сар",
  "наймдугаар сар",
  "есдүгээр сар",
  "аравдугаар сар",
  "арван нэгдүгээр сар",
  "арван хоёрдугаар сар",
];

function getDemoUnlockDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  date.setHours(12, 0, 0, 0);
  return date;
}

function formatPreviewDate(date) {
  return `${date.getFullYear()} оны ${
    mongolianMonths[date.getMonth()]
  } ${date.getDate()}`;
}

export function CapsulePreview() {
  const [preview, setPreview] = useState({
    unlockDate: null,
    parts: null,
  });

  useEffect(() => {
    const unlockDate = getDemoUnlockDate();
    const updatePreview = () => {
      setPreview({
        unlockDate,
        parts: getTimeParts(unlockDate),
      });
    };

    updatePreview();
    const timer = window.setInterval(() => {
      updatePreview();
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const countdownBlocks = [
    ["Өдөр", preview.parts?.days],
    ["Цаг", preview.parts?.hours],
    ["Мин", preview.parts?.minutes],
    ["Сек", preview.parts?.seconds],
  ];

  return (
    <div className="glass reveal-card relative min-h-[460px] overflow-hidden rounded-2xl p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
      <div className="absolute -right-14 top-16 h-40 w-40 rounded-full border border-cyan-200/12" />
      <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full border border-amber-200/12" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">
            Нээгдэх өдөр
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {preview.unlockDate
              ? formatPreviewDate(preview.unlockDate)
              : "Бэлдэж байна..."}
          </p>
        </div>
        <div className="rounded-lg bg-white/10 p-3 text-amber-200">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <div className="relative mt-12 flex justify-center">
        <div className="orbit-ring h-72 w-72" />
        <div className="capsule-glow" />
        <div className="capsule-shell floating-capsule relative h-60 w-40 rounded-full border border-white/20 shadow-2xl shadow-black/50">
          <div className="absolute inset-x-6 top-8 h-24 rounded-full bg-white/18 blur-sm" />
          <div className="absolute inset-x-4 bottom-5 h-20 rounded-full border border-amber-100/20 bg-black/20" />
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-zinc-950/40 text-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.2)]">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-4 gap-2">
        {countdownBlocks.map(([label, value]) => (
          <div
            key={label}
            className="countdown-tile rounded-lg bg-black/24 p-3 text-center"
          >
            <p className="font-mono text-2xl font-semibold text-white">
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[0.64rem] uppercase tracking-[0.16em] text-slate-400">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
