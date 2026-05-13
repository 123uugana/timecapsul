"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, LogOut, Plus, Timer } from "lucide-react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { AuthNotice } from "@/components/AuthNotice";
import { Button } from "@/components/Button";
import { CapsuleCard } from "@/components/CapsuleCard";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isUnlocked } from "@/lib/time";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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

      setUser(authData.user);

      const [{ data: profileData }, { data: capsuleData, error: capsuleError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", authData.user.id)
            .maybeSingle(),
          supabase
            .from("capsules")
            .select("id,user_id,title,unlock_date,is_public,recipient_email,created_at")
            .eq("user_id", authData.user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (capsuleError) {
        setError(capsuleError.message);
      } else {
        setCapsules(capsuleData || []);
      }

      setProfile(profileData);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const stats = useMemo(() => {
    const unlocked = capsules.filter((capsule) =>
      isUnlocked(capsule.unlock_date),
    ).length;

    return {
      total: capsules.length,
      locked: capsules.length - unlocked,
      unlocked,
    };
  }, [capsules]);

  async function signOut() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
  }

  return (
    <main className="app-background relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-white">
            DTCS
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/capsules/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Шинэ capsule
            </Link>
            <Button variant="secondary" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Гарах
            </Button>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="glass reveal-up rounded-2xl p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              {profile?.username || user?.email?.split("@")[0] || "Таны архив"}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Мессежүүдээ нээгдэх өдөр хүртэл битүүмжилж хадгал. Хувийн capsule
              зөвхөн танд харагдана, public capsule нь нээгдсэний дараа link-ээр
              нээгдэнэ.
            </p>

            {!isSupabaseConfigured() ? (
              <div className="mt-6">
                <AuthNotice />
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["Нийт", stats.total],
                ["Түгжээтэй", stats.locked],
                ["Нээгдсэн", stats.unlocked],
              ].map(([label, value]) => (
                <div key={label} className="countdown-tile glass-soft rounded-lg p-4">
                  <p className="font-mono text-3xl font-semibold text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass reveal-up rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-slate-400">
                  Capsules
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Таны битүүмжилсэн мессежүүд
                </h2>
              </div>
              <Timer className="h-6 w-6 text-amber-200" aria-hidden="true" />
            </div>

            {loading ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[0, 1].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-xl bg-white/8"
                  />
                ))}
              </div>
            ) : error ? (
              <p className="mt-6 text-sm text-rose-200">{error}</p>
            ) : capsules.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {capsules.map((capsule) => (
                  <CapsuleCard key={capsule.id} capsule={capsule} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-white/18 p-8 text-center">
                <Archive className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Capsule алга байна
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-300">
                  Эхний ирээдүйн мессежээ бичээд нээгдэх өдрийг нь сонгоно уу.
                </p>
                <Link
                  href="/capsules/new"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Capsule үүсгэх
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
