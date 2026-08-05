import "server-only";

// Надсилання листів через Resend (https://resend.com).
// Потрібен RESEND_API_KEY. RESEND_FROM — адреса відправника з верифікованого
// домену; для тесту можна лишити onboarding@resend.dev.

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "DevqSpace <onboarding@resend.dev>";

export function emailEnabled(): boolean {
  return Boolean(API_KEY);
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!API_KEY) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
      cache: "no-store",
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("[email] resend error:", res.status, t);
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] send error:", e);
    return { ok: false, error: "network" };
  }
}

// Лист із посиланням на завантаження придбаного товару.
export async function sendDeliveryEmail(
  to: string,
  productTitle: string,
  downloadUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#e5e7eb;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
    <div style="padding:28px 28px 8px">
      <div style="font-weight:700;font-size:20px;color:#00f0ff;letter-spacing:-.5px">DevqSpace</div>
    </div>
    <div style="padding:8px 28px 28px">
      <h1 style="font-size:22px;margin:12px 0 8px;color:#fff">Дякуємо за покупку! 🎉</h1>
      <p style="color:#9aa4b2;line-height:1.6;margin:0 0 20px">
        Оплату підтверджено. Ваш товар <b style="color:#fff">${esc(productTitle)}</b> готовий до завантаження.
      </p>
      <a href="${esc(downloadUrl)}" style="display:inline-block;background:linear-gradient(90deg,#00f0ff,#8a2be2);color:#05070a;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px">
        ⬇ Завантажити архів
      </a>
      <p style="color:#5b6472;font-size:12px;line-height:1.6;margin:20px 0 0">
        Посилання персональне. Якщо кнопка не працює, скопіюйте:<br>
        <span style="color:#8b8f98;word-break:break-all">${esc(downloadUrl)}</span>
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,.06);color:#5b6472;font-size:12px">
      DevqSpace — цифрова студія. Гарантія 1 рік і повний сорс-код.
    </div>
  </div>`;
  return sendEmail(to, `Ваш товар: ${productTitle}`, html);
}
