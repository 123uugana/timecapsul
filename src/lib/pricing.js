export const PAYMENT_CURRENCY = "mnt"; // Stripe currency is set here. Replace in one place if provider requirements change.
export const FREE_CAPSULE_LIMIT = 5;

// Price amounts are stored here in Mongolian Tugrik. UI must use only ₮ / MNT.
export const PRICING_PLANS = {
  free: {
    id: "free",
    name: "Үнэгүй",
    displayPrice: "0₮",
    amountMnt: 0,
    stripeUnitAmount: 0,
    interval: null,
    description: "Эхний 5 capsule хүртэл үнэгүй ашиглана.",
    features: ["5 хүртэл capsule", "Текст capsule", "Countdown болон нээх хуудас"],
  },
  premiumMonthly: {
    id: "premium_monthly",
    name: "Premium",
    displayPrice: "15,000₮",
    amountMnt: 15000,
    stripeUnitAmount: 15000 * 100,
    interval: "month",
    description: "Илүү олон дурсамж хадгалах сарын эрх.",
    features: ["Хязгааргүй capsule", "Public/private нээх link", "AI Memory Experience"],
  },
  aiCinematicReveal: {
    id: "ai_cinematic_reveal",
    name: "AI Cinematic Reveal",
    displayPrice: "3,000₮",
    amountMnt: 3000,
    stripeUnitAmount: 3000 * 100,
    interval: null,
    description: "Нэг capsule-д зориулсан cinematic AI reveal.",
    features: ["Cinematic narration текст", "Сэтгэл хөдлөлтэй rewrite", "Share card текст"],
  },
};

export function getPaidProduct(productId) {
  return Object.values(PRICING_PLANS).find(
    (plan) => plan.id === productId && plan.amountMnt > 0,
  );
}

export function isPremiumProfile(profile) {
  if (!profile || profile.plan !== "premium") {
    return false;
  }

  if (!profile.premium_until) {
    return true;
  }

  return new Date(profile.premium_until).getTime() > Date.now();
}
