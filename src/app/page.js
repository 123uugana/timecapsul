import Link from "next/link";
import { ArrowRight, CalendarClock, LockKeyhole, Mail } from "lucide-react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { CapsulePreview } from "@/components/CapsulePreview";
import { MemoryReel } from "@/components/MemoryReel";

const features = [
  {
    icon: LockKeyhole,
    title: "Дурсамжаа битүүмжил",
    copy: "Текст capsule бичээд нээгдэх өдрөө сонгоно. Тэр өдөр хүртэл мессеж нууц хэвээр байна.",
  },
  {
    icon: Mail,
    title: "Хүнд зориулж илгээ",
    copy: "Найздаа эсвэл ирээдүйн өөртөө зориулсан capsule үүсгээд цаг нь болохоор нээнэ.",
  },
  {
    icon: CalendarClock,
    title: "Countdown хар",
    copy: "Capsule бүр нээгдэх өдөр хүртэл cinematic countdown болон locked preview-тэй байна.",
  },
];

export default function Home() {
  return (
    <main className="app-background relative min-h-screen overflow-hidden">
      <AmbientBackdrop />
      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-white">
          DTCS
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/8"
          >
            Үнэ
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/8"
          >
            Нэвтрэх
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
          >
            App нээх
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-20 lg:pt-16">
        <div className="reveal-up">
          <p className="text-sm uppercase tracking-[0.34em] text-amber-200/80">
            Digital Time Capsule Social
          </p>
          <h1 className="text-balance mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Ирээдүйн өөртөө үлдээх дурсамж.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Өөртөө эсвэл найздаа зориулж текст capsule үүсгэ. Нээгдэх өдөр
            хүртэл мессеж blur-тэй, битүүмжилсэн, countdown-тэй байна.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              Capsule үүсгэх
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/8 px-5 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Dashboard харах
            </Link>
          </div>
        </div>

        <CapsulePreview />
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-7 sm:px-8">
        <MemoryReel />
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-4 px-5 pb-12 sm:px-8 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="glass-soft reveal-card rounded-xl p-5">
            <div className="mb-5 inline-flex rounded-lg bg-white/10 p-3 text-amber-200">
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {feature.copy}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
