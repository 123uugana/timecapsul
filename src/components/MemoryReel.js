const frames = [
  {
    title: "Letters",
    meta: "private",
    tone: "from-amber-200/36 via-rose-300/18 to-cyan-300/20",
  },
  {
    title: "Birthdays",
    meta: "2031",
    tone: "from-cyan-200/28 via-indigo-300/18 to-amber-200/22",
  },
  {
    title: "Promises",
    meta: "sealed",
    tone: "from-emerald-200/26 via-amber-200/18 to-rose-300/22",
  },
  {
    title: "Reunions",
    meta: "future",
    tone: "from-fuchsia-200/24 via-cyan-200/16 to-amber-200/24",
  },
];

export function MemoryReel() {
  return (
    <div className="memory-reel glass-soft overflow-hidden rounded-xl p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Memory reel
        </span>
        <span className="h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_24px_rgba(253,164,175,0.9)]" />
      </div>
      <div className="reel-track">
        {[...frames, ...frames].map((frame, index) => (
          <div
            key={`${frame.title}-${index}`}
            className={`reel-frame bg-gradient-to-br ${frame.tone}`}
          >
            <div className="film-perfs film-perfs-top" />
            <div className="film-perfs film-perfs-bottom" />
            <div className="relative z-10 flex h-full flex-col justify-end p-4">
              <p className="text-lg font-semibold text-white">{frame.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/58">
                {frame.meta}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
