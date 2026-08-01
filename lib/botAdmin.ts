import "server-only";
import {
  getAllProducts,
  getProductAnalytics,
  getViewsRanking,
  getStats,
  getTotalViews,
  saveProduct,
  slugExists,
  deleteProduct,
  getProductBySlug,
  type ProductAnalytics,
} from "./store";
import { buildProduct, CATEGORY_IDS } from "./productInput";
import { CATEGORIES } from "./products";
import { ORDER_STATUS_LABEL, type InlineKeyboard } from "./telegram";

// =====================================================================
// Адмін-функціонал Telegram-бота: аналітика товарів + керування каталогом.
// Кожна функція повертає готовий текст (+ опційно інлайн-клавіатуру),
// які route handler (app/api/tg-webhook) відправляє в чат адміна.
// =====================================================================

export type BotReply = { text: string; keyboard?: InlineKeyboard };

const PAGE_SIZE = 8;

// ---- Формат чисел ---------------------------------------------------

function fmt(n: number): string {
  return Math.round(n).toLocaleString("uk-UA");
}

function money(n: number): string {
  return `$${fmt(n)}`;
}

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

// =====================================================================
// Тексти /start і /help
// =====================================================================

export function startText(): string {
  return (
    "👋 <b>NEXUS Admin Bot online</b>\n\n" +
    "Замовлення з сайту приходять сюди автоматично. А ще я вмію показувати " +
    "аналітику й керувати каталогом:\n\n" +
    "📊 /app — дашборд (Mini App) з графіками\n" +
    "📈 /stats — загальна аналітика\n" +
    "📦 /products — каталог + керування\n" +
    "👁 /views — рейтинг за переглядами\n" +
    "➕ /add — додати товар\n\n" +
    "/help — повний список команд"
  );
}

export function helpText(): string {
  return (
    "🛠 <b>Команди</b>\n\n" +
    "<b>Дашборд</b>\n" +
    "/app — відкрити Mini App з графіками й аналітикою\n\n" +
    "<b>Аналітика</b>\n" +
    "/stats — загальна статистика (замовлення, виторг, перегляди)\n" +
    "/views — топ товарів за переглядами\n" +
    "/product <code>&lt;slug&gt;</code> — повна аналітика товару\n\n" +
    "<b>Каталог</b>\n" +
    "/products — список товарів з кнопками керування\n" +
    "/find <code>&lt;текст&gt;</code> — знайти товар\n" +
    "/add — додати товар (пришле шаблон)\n" +
    "/setprice <code>&lt;slug&gt; &lt;ціна&gt;</code> — змінити ціну\n" +
    "/del <code>&lt;slug&gt;</code> — видалити товар\n\n" +
    "<b>Службові</b>\n" +
    "/ping — перевірити доступність\n" +
    "/where — дізнатися chat_id"
  );
}

// =====================================================================
// /stats — загальна аналітика
// =====================================================================

export async function statsReply(): Promise<BotReply> {
  const [stats, totalViews, ranking] = await Promise.all([
    getStats(),
    getTotalViews(),
    getViewsRanking(5),
  ]);

  const lines: string[] = [
    "📊 <b>Загальна аналітика</b>",
    "",
    "🛒 <b>Замовлення</b>",
    `Всього: ${fmt(stats.total)} · за 7 днів: ${fmt(stats.last7days)}`,
    `${ORDER_STATUS_LABEL.new}: ${fmt(stats.byStatus.new)} · ` +
      `${ORDER_STATUS_LABEL.in_progress}: ${fmt(stats.byStatus.in_progress)}`,
    `${ORDER_STATUS_LABEL.done}: ${fmt(stats.byStatus.done)} · ` +
      `${ORDER_STATUS_LABEL.rejected}: ${fmt(stats.byStatus.rejected)}`,
    `Продукти: ${fmt(stats.byType.product)} · кастом: ${fmt(stats.byType.custom)}`,
    "",
    "💰 <b>Виторг</b>",
    `Оплачено: ${money(stats.paidRevenue)} (${fmt(stats.paidCount)} замовл.)`,
    `Закрито угод: ${money(stats.revenueEstimate)}`,
    "",
    "👁 <b>Перегляди</b>",
    `Всього по каталогу: ${fmt(totalViews)}`,
  ];

  if (ranking.length) {
    lines.push("");
    lines.push("🔥 <b>Топ за переглядами</b>");
    ranking.forEach((r, i) => {
      lines.push(`${i + 1}. <code>${r.slug}</code> — ${fmt(r.views)}`);
    });
  }

  if (stats.topProducts.length) {
    lines.push("");
    lines.push("🏆 <b>Топ за замовленнями</b>");
    stats.topProducts.forEach((p, i) => {
      lines.push(`${i + 1}. ${escapeHtml(p.title)} — ${fmt(p.count)}`);
    });
  }

  return {
    text: lines.join("\n"),
    keyboard: {
      inline_keyboard: [
        [{ text: "📦 Каталог", callback_data: "pl:0" }],
        [{ text: "👁 Рейтинг переглядів", callback_data: "vr" }],
      ],
    },
  };
}

// =====================================================================
// /views — рейтинг товарів за переглядами
// =====================================================================

export async function viewsRankingReply(): Promise<BotReply> {
  const [ranking, products] = await Promise.all([
    getViewsRanking(20),
    getAllProducts(),
  ]);
  const titleBySlug = new Map(products.map((p) => [p.slug, p.title]));

  if (!ranking.length) {
    return { text: "👁 Переглядів ще немає. Дані з'являться, коли хтось відкриє сторінку товару." };
  }

  const lines = ["👁 <b>Рейтинг за переглядами</b>", ""];
  ranking.forEach((r, i) => {
    const title = titleBySlug.get(r.slug) ?? r.slug;
    lines.push(`${i + 1}. ${escapeHtml(title)} — <b>${fmt(r.views)}</b>`);
  });

  // Кнопки на топ-8 товарів для швидкого переходу в деталі
  const rows: { text: string; callback_data: string }[][] = [];
  ranking.slice(0, 8).forEach((r) => {
    const title = titleBySlug.get(r.slug) ?? r.slug;
    rows.push([{ text: `📊 ${trunc(title, 28)}`, callback_data: `pv:${r.slug}` }]);
  });

  return { text: lines.join("\n"), keyboard: { inline_keyboard: rows } };
}

// =====================================================================
// /products — список товарів з пагінацією і кнопками
// =====================================================================

export async function productsListReply(page = 0): Promise<BotReply> {
  const products = (await getAllProducts()).sort((a, b) =>
    a.title.localeCompare(b.title, "uk"),
  );
  if (!products.length) {
    return { text: "📦 Каталог порожній. Додайте товар: /add" };
  }

  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const p = Math.min(Math.max(0, page), pages - 1);
  const slice = products.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);

  const text =
    `📦 <b>Каталог</b> — ${products.length} товарів\n` +
    `Сторінка ${p + 1}/${pages}. Натисніть товар для аналітики:`;

  const rows = slice.map((prod) => [
    {
      text: `${trunc(prod.title, 30)} · $${prod.price}`,
      callback_data: `pv:${prod.slug}`,
    },
  ]);

  // Навігація
  const nav: { text: string; callback_data: string }[] = [];
  if (p > 0) nav.push({ text: "◀", callback_data: `pl:${p - 1}` });
  if (p < pages - 1) nav.push({ text: "▶", callback_data: `pl:${p + 1}` });
  if (nav.length) rows.push(nav);

  return { text, keyboard: { inline_keyboard: rows } };
}

// =====================================================================
// Деталі + аналітика одного товару
// =====================================================================

function analyticsText(a: ProductAnalytics): string {
  const { product: prod, views, orderStats, conversion } = a;
  return [
    `📦 <b>${escapeHtml(prod.title)}</b>`,
    `<code>${prod.slug}</code> · ${categoryLabel(prod.category)}`,
    "",
    `💵 Ціна: <b>${money(prod.price)}</b>`,
    `⭐ ${prod.rating} (${fmt(prod.ratingCount)} відгуків)`,
    "",
    "👁 <b>Перегляди</b>",
    `Всього: <b>${fmt(views.total)}</b>`,
    `7 днів: ${fmt(views.last7)} · 30 днів: ${fmt(views.last30)} · сьогодні: ${fmt(views.today)}`,
    "",
    "🛒 <b>Замовлення</b>",
    `Всього: ${fmt(orderStats.orders)} · оплачено: ${fmt(orderStats.paid)}`,
    `Виторг (оплач.): ${money(orderStats.paidRevenue)}`,
    `Виторг (закрито): ${money(orderStats.doneRevenue)}`,
    `Лічильник «продано»: ${fmt(prod.sold)}`,
    "",
    `📈 Конверсія: <b>${conversion.toFixed(1)}%</b> (замовлень / переглядів)`,
  ].join("\n");
}

function detailKeyboard(slug: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "💵 Змінити ціну", callback_data: `pp:${slug}` },
        { text: "🗑 Видалити", callback_data: `pd:${slug}` },
      ],
      [{ text: "◀ До списку", callback_data: "pl:0" }],
    ],
  };
}

export async function productDetailReply(slug: string): Promise<BotReply> {
  const a = await getProductAnalytics(slug);
  if (!a) return { text: `Товар <code>${escapeHtml(slug)}</code> не знайдено.` };
  return { text: analyticsText(a), keyboard: detailKeyboard(slug) };
}

// =====================================================================
// /find — пошук товару
// =====================================================================

export async function findReply(query: string): Promise<BotReply> {
  const q = query.trim().toLowerCase();
  if (!q) return { text: "Вкажіть текст для пошуку: /find бот" };
  const products = await getAllProducts();
  const matches = products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q),
  );
  if (!matches.length) {
    return { text: `Нічого не знайдено за «${escapeHtml(query)}».` };
  }
  const rows = matches.slice(0, 10).map((p) => [
    { text: `${trunc(p.title, 30)} · $${p.price}`, callback_data: `pv:${p.slug}` },
  ]);
  return {
    text: `🔎 Знайдено ${matches.length} — оберіть для аналітики:`,
    keyboard: { inline_keyboard: rows },
  };
}

// =====================================================================
// /add — додати товар (single-message шаблон key: value)
// =====================================================================

const ADD_ALIASES: Record<string, string> = {
  назва: "title",
  ціна: "price",
  цена: "price",
  категорія: "category",
  категория: "category",
  опис: "description",
  описание: "description",
  підзаголовок: "tagline",
  слоган: "tagline",
  колір: "accent",
  цвет: "accent",
  бейдж: "badge",
  зображення: "image",
  картинка: "image",
  стек: "stack",
  можливості: "features",
  доставка: "delivery",
  гарантія: "warranty",
  продано: "sold",
  рейтинг: "rating",
};

function addTemplate(): string {
  return (
    "➕ <b>Додати товар</b>\n\n" +
    "Надішліть одним повідомленням (скопіюйте та заповніть):\n\n" +
    "<code>/add\n" +
    "title: Назва товару\n" +
    "price: 100\n" +
    "category: web\n" +
    "tagline: Короткий опис одним рядком\n" +
    "description: Повний опис товару\n" +
    "stack: Next.js, TypeScript, Redis\n" +
    "features: Фіча 1, Фіча 2, Фіча 3</code>\n\n" +
    "<b>Обов'язкове лише</b> <code>title</code>. Категорії:\n" +
    CATEGORY_IDS.map((c) => `• <code>${c}</code> — ${categoryLabel(c)}`).join(
      "\n",
    ) +
    "\n\nКолір (accent): blue / purple / pink / green"
  );
}

// Парсить тіло повідомлення (без команди /add) у словник полів.
function parseAddBody(raw: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const rawKey = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (!rawKey || !value) continue;
    const key = ADD_ALIASES[rawKey] ?? rawKey;
    body[key] = value;
  }
  return body;
}

export async function addProductReply(rawBody: string): Promise<BotReply> {
  const body = parseAddBody(rawBody);
  if (!body.title) {
    return { text: addTemplate() };
  }

  const product = buildProduct(body);
  if (!product) {
    return { text: "⚠️ Не вдалось розпізнати товар. Потрібен хоча б <code>title</code>." };
  }

  if (await slugExists(product.slug)) {
    return {
      text:
        `⚠️ Товар зі slug <code>${escapeHtml(product.slug)}</code> вже існує.\n` +
        `Додайте рядок <code>slug: інший-slug</code> або змініть назву.`,
    };
  }

  await saveProduct(product);
  return {
    text:
      `✅ <b>Товар додано</b>\n\n` +
      `${escapeHtml(product.title)}\n` +
      `<code>${product.slug}</code> · ${categoryLabel(product.category)} · ${money(product.price)}`,
    keyboard: {
      inline_keyboard: [
        [{ text: "📊 Відкрити аналітику", callback_data: `pv:${product.slug}` }],
      ],
    },
  };
}

// =====================================================================
// /setprice <slug> <price>
// =====================================================================

export async function setPriceReply(args: string[]): Promise<BotReply> {
  const [slug, priceRaw] = args;
  if (!slug || priceRaw === undefined) {
    return { text: "Формат: /setprice <code>&lt;slug&gt; &lt;ціна&gt;</code>" };
  }
  const price = Math.round(Number(priceRaw));
  if (!Number.isFinite(price) || price < 0) {
    return { text: "Ціна має бути невід'ємним числом." };
  }
  const product = await getProductBySlug(slug);
  if (!product) {
    return { text: `Товар <code>${escapeHtml(slug)}</code> не знайдено.` };
  }
  const old = product.price;
  await saveProduct({ ...product, price });
  return {
    text:
      `✅ Ціну оновлено: ${escapeHtml(product.title)}\n` +
      `${money(old)} → <b>${money(price)}</b>`,
    keyboard: {
      inline_keyboard: [
        [{ text: "📊 Аналітика", callback_data: `pv:${slug}` }],
      ],
    },
  };
}

// =====================================================================
// Видалення товару (з підтвердженням)
// =====================================================================

export async function deletePromptReply(slug: string): Promise<BotReply> {
  const product = await getProductBySlug(slug);
  if (!product) {
    return { text: `Товар <code>${escapeHtml(slug)}</code> не знайдено.` };
  }
  return {
    text:
      `🗑 Видалити <b>${escapeHtml(product.title)}</b>?\n` +
      `<code>${product.slug}</code> · ${money(product.price)}\n\n` +
      `<i>Дію не можна скасувати.</i>`,
    keyboard: {
      inline_keyboard: [
        [
          { text: "✅ Так, видалити", callback_data: `pdy:${slug}` },
          { text: "◀ Скасувати", callback_data: `pv:${slug}` },
        ],
      ],
    },
  };
}

export async function doDeleteReply(slug: string): Promise<BotReply> {
  const product = await getProductBySlug(slug);
  if (!product) {
    return { text: `Товар <code>${escapeHtml(slug)}</code> вже видалено.` };
  }
  await deleteProduct(slug);
  return {
    text: `🗑 Видалено: ${escapeHtml(product.title)} (<code>${slug}</code>).`,
    keyboard: {
      inline_keyboard: [[{ text: "◀ До списку", callback_data: "pl:0" }]],
    },
  };
}

// =====================================================================
// Prompt для зміни ціни через кнопку (просить надіслати /setprice)
// =====================================================================

export async function pricePromptReply(slug: string): Promise<BotReply> {
  const product = await getProductBySlug(slug);
  if (!product) {
    return { text: `Товар <code>${escapeHtml(slug)}</code> не знайдено.` };
  }
  return {
    text:
      `💵 Поточна ціна ${escapeHtml(product.title)}: <b>${money(product.price)}</b>\n\n` +
      `Щоб змінити, надішліть:\n<code>/setprice ${product.slug} НОВА_ЦІНА</code>`,
  };
}

// ---- utils ----------------------------------------------------------

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
