"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function ShareCapsuleButton({ capsuleId, isPublic }) {
  const [copied, setCopied] = useState(false);
  const path = `/capsules/${capsuleId}/unlock`;

  async function copyLink() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/12 sm:w-auto"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-200" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? "Link copy боллоо" : "Найзуудтай share хийх"}
      </button>

      {!isPublic ? (
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-100">
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Энэ capsule private байна. Найзууд link-ээр үзүүлэх бол capsule үүсгэхдээ
          public сонгоно уу.
        </p>
      ) : null}
    </div>
  );
}
