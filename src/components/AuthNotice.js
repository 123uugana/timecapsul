export function AuthNotice() {
  return (
    <div className="glass-soft rounded-lg border-amber-200/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
      Supabase тохиргоо хийгдээгүй байна.
      <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">
        NEXT_PUBLIC_SUPABASE_URL
      </code>
      болон
      <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">
        NEXT_PUBLIC_SUPABASE_ANON_KEY
      </code>
      env дээр нэмнэ үү.
    </div>
  );
}
