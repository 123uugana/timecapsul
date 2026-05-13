"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus, LockKeyhole, ShieldAlert } from "lucide-react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { AuthNotice } from "@/components/AuthNotice";
import { Button } from "@/components/Button";
import { FREE_CAPSULE_LIMIT, isPremiumProfile } from "@/lib/pricing";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function defaultUnlockDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function NewCapsulePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState(defaultUnlockDate);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [profile, setProfile] = useState(null);
  const [capsuleCount, setCapsuleCount] = useState(0);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = getSupabase();
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);

      const [{ data: profileData }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle(),
        supabase
          .from("capsules")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id),
      ]);

      setProfile(profileData);
      setCapsuleCount(count || 0);
    }

    loadUser();
  }, [router]);

  async function createCapsule(event) {
    event.preventDefault();
    setError("");

    const supabase = getSupabase();
    if (!supabase || !user) {
      setError("Capsule үүсгэхийн тулд эхлээд нэвтэрнэ үү.");
      return;
    }

    if (!isPremiumProfile(profile) && capsuleCount >= FREE_CAPSULE_LIMIT) {
      setError(
        `Үнэгүй эрхээр ${FREE_CAPSULE_LIMIT} capsule хүртэл үүсгэнэ. Premium эрх авбал үргэлжлүүлэн үүсгэж болно.`,
      );
      return;
    }

    const unlockAt = new Date(unlockDate);
    if (Number.isNaN(unlockAt.getTime()) || unlockAt.getTime() <= Date.now()) {
      setError("Нээгдэх огноог ирээдүйн огноогоор сонгоно уу.");
      return;
    }

    setLoading(true);
    const { data, error: insertError } = await supabase
      .from("capsules")
      .insert({
        user_id: user.id,
        title,
        message,
        unlock_date: unlockAt.toISOString(),
        is_public: isPublic,
        recipient_email: recipientEmail || null,
        notification_email: recipientEmail || user.email,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/capsules/${data.id}`);
  }

  return (
    <main className="app-background relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        <section className="glass reveal-up mt-8 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
                Шинэ capsule
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white">
                Одоо бич. Дараа нь нээ.
              </h1>
            </div>
            <div className="hidden rounded-lg bg-white/10 p-3 text-amber-200 sm:block">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="mt-6">
              <AuthNotice />
            </div>
          ) : null}

          <form className="mt-8 grid gap-5" onSubmit={createCapsule}>
            <label className="block text-sm font-medium text-slate-200">
              Гарчиг
              <input
                className="form-field mt-2"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Төгсөлтийн өдөрт зориулсан захиа"
                maxLength={120}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-200">
              Мессеж
              <textarea
                className="form-field mt-2 min-h-52 resize-y"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ирээдүйн надад..."
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-200">
                Нээгдэх огноо
                <input
                  className="form-field mt-2"
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(event) => setUnlockDate(event.target.value)}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                Найзын имэйл
                <input
                  className="form-field mt-2"
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="friend@example.com"
                />
              </label>
            </div>

            <label className="glass-soft flex cursor-pointer items-start gap-3 rounded-lg p-4 text-sm text-slate-200">
              <input
                className="mt-1 h-4 w-4 accent-amber-300"
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
              />
              <span>
                Найзууд link-ээр үзэж болох public capsule болгох. Нээгдэх өдөр
                хүртэл message түгжээтэй хэвээр байна.
              </span>
            </label>

            <div>
              <button
                type="button"
                onClick={() => setShowPrivacyNotice((current) => !current)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-200/20 bg-amber-300/10 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/16"
              >
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Privacy анхааруулга
              </button>

              {showPrivacyNotice ? (
                <div className="mt-4 rounded-xl border border-amber-200/18 bg-black/24 p-5 text-sm leading-6 text-slate-200">
                  <p className="font-semibold text-white">
                    Capsule-ээ share хийхээс өмнө үүнийг мэдээрэй.
                  </p>
                  <ul className="mt-3 space-y-2 text-slate-300">
                    <li>
                      Private capsule бол зөвхөн таны account дээр харагдана.
                    </li>
                    <li>
                      Public capsule бол link авсан хүн unlock page-г үзэж чадна.
                    </li>
                    <li>
                      Нээгдэх өдөр болоогүй үед message түгжээтэй, blur хэвээр байна.
                    </li>
                    <li>
                      Найзын имэйл оруулбал notification илгээхэд ашиглана. Public
                      page дээр энэ имэйл харагдахгүй.
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>

            {recipientEmail ? (
              <div className="glass-soft rounded-lg p-4 text-sm leading-6 text-slate-200">
                <p className="font-medium text-white">Найздаа зориулсан capsule</p>
                <p className="mt-1 text-slate-300">
                  Нээгдэх цаг болоход notification email
                  <span className="mx-1 font-medium text-amber-100">
                    {recipientEmail}
                  </span>
                  рүү илгээгдэхээр хадгалагдана.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-rose-200">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Буцах
              </Link>
              <Button disabled={loading}>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                {loading ? "Битүүмжилж байна..." : "Capsule битүүмжлэх"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
