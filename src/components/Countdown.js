"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { getTimeParts, isUnlocked } from "@/lib/time";

export function Countdown({ unlockDate }) {
  const [parts, setParts] = useState(() => getTimeParts(unlockDate));
  const unlocked = isUnlocked(unlockDate);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParts(getTimeParts(unlockDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [unlockDate]);

  if (unlocked) {
    return (
      <div className="glass-soft flex items-center gap-3 rounded-lg px-4 py-3 text-emerald-100">
        <Clock3 className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-medium">Энэ capsule нээгдсэн байна.</span>
      </div>
    );
  }

  const blocks = [
    ["Өдөр", parts.days],
    ["Цаг", parts.hours],
    ["Мин", parts.minutes],
    ["Сек", parts.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {blocks.map(([label, value]) => (
        <div
          key={label}
          className="countdown-tile glass-soft rounded-lg px-2 py-3 text-center sm:px-4"
        >
          <div className="font-mono text-xl font-semibold text-white sm:text-3xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
