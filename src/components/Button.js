export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary:
      "bg-amber-300 text-zinc-950 hover:bg-amber-200 focus-visible:outline-amber-200",
    secondary:
      "border border-white/15 bg-white/8 text-white hover:bg-white/12 focus-visible:outline-white/60",
    ghost:
      "text-slate-200 hover:bg-white/8 focus-visible:outline-white/60",
    danger:
      "border border-rose-300/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/18 focus-visible:outline-rose-200",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
