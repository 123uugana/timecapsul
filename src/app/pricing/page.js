import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { PRICING_PLANS } from "@/lib/pricing";

const plans = [
  PRICING_PLANS.free,
  PRICING_PLANS.premiumMonthly,
  PRICING_PLANS.aiCinematicReveal,
];

export default async function PricingPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const payment = resolvedSearchParams?.payment;

  return (
    <main className="app-background relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Нүүр
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
          >
            Dashboard
          </Link>
        </nav>

        <section className="reveal-up mx-auto max-w-3xl py-14 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
            Үнэ ба эрх
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
            Бүх төлбөр MNT / ₮ байна.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Үнэгүй хэрэглэгч 5 capsule хүртэл үүсгэнэ. Илүү их хадгалах эсвэл
            нэг удаагийн cinematic reveal авах бол Premium болон AI нэмэлт эрх
            сонгоно уу.
          </p>

          {payment === "success" ? (
            <div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
              Төлбөр амжилттай. Stripe webhook тохируулагдсан бол эрх автоматаар
              шинэчлэгдэнэ.
            </div>
          ) : null}
          {payment === "cancelled" ? (
            <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              Төлбөр цуцлагдлаа. Та хүссэн үедээ дахин оролдож болно.
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 pb-12 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`glass reveal-card rounded-2xl p-6 ${
                plan.id === "premium_monthly"
                  ? "border-amber-200/28"
                  : ""
              }`}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {plan.description}
                  </p>
                </div>
                {plan.id === "premium_monthly" ? (
                  <div className="rounded-lg bg-amber-300/12 p-3 text-amber-200">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                ) : null}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-semibold text-white">
                  {plan.displayPrice}
                </span>
                {plan.interval === "month" ? (
                  <span className="ml-2 text-sm text-slate-400">/ сар</span>
                ) : plan.id === "ai_cinematic_reveal" ? (
                  <span className="ml-2 text-sm text-slate-400">
                    нэг удаа
                  </span>
                ) : null}
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                  MNT
                </p>
              </div>

              <ul className="mb-7 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Link
                  href="/login"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Үнэгүй эхлэх
                </Link>
              ) : (
                <CheckoutButton productId={plan.id}>
                  {plan.id === "premium_monthly"
                    ? "Premium авах"
                    : "Reveal авах"}
                </CheckoutButton>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
