import {
  tgSetWebhook,
  tgGetWebhookInfo,
  tgDeleteWebhook,
} from "@/lib/telegram";

// Setup endpoint для активації webhook.
//
// Виклик (1 раз після деплою):
//   GET https://<your-domain>/api/tg-webhook/setup?key=<SETUP_KEY>
//
// Можна додати &action=info щоб подивитися поточний стан, або
// &action=delete щоб скинути.
//
// Захист через query param ?key=... — це не secret рівня production,
// просто щоб випадковий запит з інтернету не міг чіпати ваш бот.

const SETUP_KEY = process.env.TELEGRAM_SETUP_KEY;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const action = url.searchParams.get("action") ?? "set";

  if (!SETUP_KEY || key !== SETUP_KEY) {
    return Response.json(
      { ok: false, error: "Invalid setup key" },
      { status: 401 },
    );
  }

  if (action === "info") {
    const info = await tgGetWebhookInfo();
    return Response.json(info);
  }

  if (action === "delete") {
    const r = await tgDeleteWebhook();
    return Response.json(r);
  }

  // default: action=set
  if (!WEBHOOK_SECRET) {
    return Response.json(
      { ok: false, error: "TELEGRAM_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  // Сам URL береться з поточного хосту запиту — це дозволяє
  // запускати setup і з прод-домену, і з preview-деплою.
  const proto =
    req.headers.get("x-forwarded-proto") ?? (url.protocol.replace(":", ""));
  const host = req.headers.get("x-forwarded-host") ?? url.host;
  const webhookUrl = `${proto}://${host}/api/tg-webhook`;

  const result = await tgSetWebhook(webhookUrl, WEBHOOK_SECRET);

  return Response.json({
    ...result,
    webhookUrl,
    hint: result.ok
      ? "Webhook активовано. Напишіть боту /start у Telegram."
      : "Дивіться description вище.",
  });
}
