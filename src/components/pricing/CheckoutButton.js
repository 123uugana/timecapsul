"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/Button";
import { getSupabase } from "@/lib/supabase";

export function CheckoutButton({ productId, children, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();
    const { data } = supabase
      ? await supabase.auth.getSession()
      : { data: { session: null } };

    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(data.session?.access_token
          ? { Authorization: `Bearer ${data.session.access_token}` }
          : {}),
      },
      body: JSON.stringify({ productId }),
    });
    const payload = await response.json();

    if (!response.ok || !payload.url) {
      setError(payload.error || "Төлбөр эхлүүлэхэд алдаа гарлаа.");
      setLoading(false);
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <div>
      <Button
        className="w-full"
        disabled={disabled || loading}
        onClick={startCheckout}
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        {loading ? "Төлбөр бэлдэж байна..." : children}
      </Button>
      {error ? <p className="mt-3 text-sm leading-6 text-rose-200">{error}</p> : null}
    </div>
  );
}
