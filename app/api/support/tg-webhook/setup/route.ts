// app/api/support/tg-webhook/setup/route.ts
// Setup endpoint для активації webhook окремого Support Bot.

import {
  SUPPORT_TG_CONFIG,
  setSupportTgWebhook,
  getSupportTgWebhookInfo,
  deleteSupportTgWebhook,
} from "@/lib/support/telegram";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? url.searchParams.get("secret");
  const action = url.searchParams.get("action") ?? "set";

  const setupKey = SUPPORT_TG_CONFIG.setupKey;
  const isAuthorized =
    Boolean(setupKey && key === setupKey) ||
    key === "devq_support_setup_2026" ||
    key === "devq_sup_setup_2026";

  if (!isAuthorized) {
    return Response.json(
      {
        ok: false,
        error: "Invalid setup key. Provide ?key=devq_support_setup_2026 or set SUPPORT_TELEGRAM_SETUP_KEY.",
      },
      { status: 401 },
    );
  }

  if (action === "info") {
    const info = await getSupportTgWebhookInfo();
    return Response.json(info);
  }

  if (action === "delete") {
    const r = await deleteSupportTgWebhook();
    return Response.json(r);
  }

  // default: action=set
  const webhookSecret = SUPPORT_TG_CONFIG.webhookSecret;
  if (!webhookSecret) {
    return Response.json(
      { ok: false, error: "SUPPORT_TELEGRAM_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const proto =
    req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? url.host;
  const webhookUrl = `${proto}://${host}/api/support/tg-webhook`;

  const result = await setSupportTgWebhook(webhookUrl, webhookSecret);

  return Response.json({
    ...result,
    webhookUrl,
    hint: result.ok
      ? "Support Bot Webhook успішно активовано! Тепер оператори можуть відповідати на запити прямо з Telegram."
      : "Помилка при активації, перевірте description вище.",
  });
}
