"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { AuthNotice } from "@/components/AuthNotice";
import { Button } from "@/components/Button";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    const supabase = getSupabase();
    if (!supabase) {
      setError("Нэвтрэхээс өмнө Supabase env тохиргоогоо нэмнэ үү.");
      return;
    }

    setLoading(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (mode === "signup" && result.data.user) {
      await supabase.from("profiles").upsert({
        id: result.data.user.id,
        username: username || email.split("@")[0],
      });
    }

    if (result.data.session || mode === "signin") {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setStatus("Бүртгэл үүслээ. Email баталгаажуулалт асаалттай бол имэйлээ шалгана уу.");
    setLoading(false);
  }

  return (
    <main className="app-background relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <AmbientBackdrop />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Нүүр рүү буцах
        </Link>

        <section className="glass reveal-up rounded-2xl p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
            Тавтай морил
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {mode === "signin" ? "Архиваа нээх" : "Архиваа эхлүүлэх"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Текст capsule бичихийн тулд нэвтрэх эсвэл бүртгэл үүсгэнэ үү.
          </p>

          {!isSupabaseConfigured() ? (
            <div className="mt-6">
              <AuthNotice />
            </div>
          ) : null}

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="block text-sm font-medium text-slate-200">
                Хэрэглэгчийн нэр
                <input
                  className="form-field mt-2"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="futurekeeper"
                  autoComplete="username"
                />
              </label>
            ) : null}
            <label className="block text-sm font-medium text-slate-200">
              Имэйл
              <input
                className="form-field mt-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Нууц үг
              <input
                className="form-field mt-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Дор хаяж 6 тэмдэгт"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </label>

            {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            {status ? <p className="text-sm text-emerald-200">{status}</p> : null}

            <Button className="w-full" disabled={loading}>
              {mode === "signin" ? (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {loading
                ? "Ажиллаж байна..."
                : mode === "signin"
                  ? "Нэвтрэх"
                  : "Бүртгэл үүсгэх"}
            </Button>
          </form>

          <button
            className="mt-5 w-full rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setStatus("");
            }}
          >
            {mode === "signin"
              ? "Бүртгэл хэрэгтэй юу? Бүртгүүлэх"
              : "Аль хэдийн бүртгэлтэй юу? Нэвтрэх"}
          </button>
        </section>
      </div>
    </main>
  );
}
