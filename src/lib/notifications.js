export function getNotificationEmail(capsule, fallbackEmail) {
  return capsule.recipient_email || capsule.notification_email || fallbackEmail;
}

export function buildUnlockEmail({ capsule, unlockUrl }) {
  return {
    subject: `Таны capsule нээгдлээ: ${capsule.title}`,
    text: [
      "Сайн байна уу.",
      "",
      `"${capsule.title}" capsule-ийн нээгдэх цаг боллоо.`,
      `Нээх link: ${unlockUrl}`,
      "",
      "Digital Time Capsule Social",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <p>Сайн байна уу.</p>
        <h1 style="font-size:22px">Таны capsule нээгдлээ</h1>
        <p><strong>${capsule.title}</strong> capsule-ийн нээгдэх цаг боллоо.</p>
        <p>
          <a href="${unlockUrl}" style="display:inline-block;background:#fbbf24;color:#111827;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:700">
            Capsule нээх
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">Digital Time Capsule Social</p>
      </div>
    `,
  };
}

export async function sendUnlockEmail({ to, capsule, unlockUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      reason: "RESEND_API_KEY эсвэл NOTIFICATION_FROM_EMAIL тохируулаагүй байна.",
    };
  }

  const email = buildUnlockEmail({ capsule, unlockUrl });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      skipped: false,
      reason: await response.text(),
    };
  }

  return {
    ok: true,
    skipped: false,
    result: await response.json(),
  };
}
