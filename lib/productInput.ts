import type {
  Accent,
  CategoryId,
  EnvField,
  EnvFieldType,
  Product,
} from "./products";

// Спільна логіка нормалізації вхідних даних товару.
// Використовується і адмін-панеллю (app/api/admin/products), і Telegram-ботом
// (lib/botAdmin) — щоб правила валідації були в одному місці.

export const ACCENTS: Accent[] = ["blue", "purple", "pink", "green"];
export const CATEGORY_IDS: CategoryId[] = [
  "telegram-bots",
  "web",
  "mobile",
  "automation",
  "web3",
  "templates",
];

export function toLines(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string")
    return v
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

// Транслітерація укр/рос кирилиці в латиницю — щоб slug з україномовної
// назви не виходив порожнім.
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie",
  ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
  ю: "iu", я: "ia", ё: "e", ъ: "", ы: "y", э: "e",
};

function transliterate(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) out += TRANSLIT[ch] ?? ch;
  return out;
}

export function slugify(s: string): string {
  return transliterate(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ---- Поля .env ------------------------------------------------------

export const ENV_FIELD_TYPES: EnvFieldType[] = [
  "text",
  "telegram_token",
  "number",
  "secret",
  "url",
];

// Ключ .env: латиниця у верхньому регістрі, цифри й підкреслення, не з цифри.
const ENV_KEY_RE = /^[A-Z_][A-Z0-9_]*$/;

export const MAX_ENV_FIELDS = 25;

export function normalizeEnvKey(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .replace(/^([0-9])/, "_$1")
    .slice(0, 64);
}

// Приводить довільний вхід (форма адмінки, JSON бота) до валідного списку
// полів. Некоректні рядки відкидаються, дублі по ключу — теж.
export function normalizeEnvFields(v: unknown): EnvField[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: EnvField[] = [];

  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const key = normalizeEnvKey(r.key);
    if (!ENV_KEY_RE.test(key) || seen.has(key)) continue;
    seen.add(key);

    const type = ENV_FIELD_TYPES.includes(r.type as EnvFieldType)
      ? (r.type as EnvFieldType)
      : "text";

    out.push({
      key,
      label: String(r.label ?? "").trim().slice(0, 120) || key,
      type,
      required: r.required === true || r.required === "true",
      placeholder: String(r.placeholder ?? "").trim().slice(0, 120) || undefined,
      hint: String(r.hint ?? "").trim().slice(0, 240) || undefined,
      defaultValue:
        String(r.defaultValue ?? "").trim().slice(0, 500) || undefined,
    });
    if (out.length >= MAX_ENV_FIELDS) break;
  }
  return out;
}

// Розбирає вміст .env.example у список полів — щоб завести товар не вручну,
// а вставкою готового файлу з шаблону. Коментар над рядком стає підказкою.
export function parseEnvExample(text: string): EnvField[] {
  const fields: EnvField[] = [];
  let comment: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      comment = [];
      continue;
    }
    if (trimmed.startsWith("#")) {
      const body = trimmed.replace(/^#+\s?/, "").trim();
      // Рядки-роздільники (── ─── ===) підказкою не є.
      if (body && !/^[\s─═=＝*_-]+$/.test(body)) comment.push(body);
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      comment = [];
      continue;
    }

    const key = normalizeEnvKey(trimmed.slice(0, eq));
    if (!ENV_KEY_RE.test(key)) {
      comment = [];
      continue;
    }

    const sample = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    fields.push({
      key,
      label: comment[0]?.slice(0, 120) || key,
      type: guessFieldType(key),
      required: true,
      placeholder: sample.slice(0, 120) || undefined,
      hint: comment.slice(1).join(" ").slice(0, 240) || undefined,
    });
    comment = [];
    if (fields.length >= MAX_ENV_FIELDS) break;
  }

  return fields;
}

function guessFieldType(key: string): EnvFieldType {
  if (/BOT_TOKEN$|^TOKEN$|TELEGRAM.*TOKEN/.test(key)) return "telegram_token";
  if (/URL$|URI$/.test(key)) return "url";
  if (/SECRET|PASSWORD|_KEY$|APIKEY/.test(key)) return "secret";
  if (/^PORT$|_ID$|COUNT|LIMIT/.test(key)) return "number";
  return "text";
}

// Будує повний об'єкт Product з довільного словника полів.
// Повертає null якщо немає обов'язкового title (або похідного slug).
export function buildProduct(body: Record<string, unknown>): Product | null {
  const title = String(body.title ?? "").trim();
  if (!title) return null;

  // slug: явний → з назви (транслітерація) → запасний (якщо назва без латиниці/кирилиці).
  const slug =
    slugify(String(body.slug ?? "").trim() || title) ||
    `product-${Date.now().toString(36)}`;

  const category = CATEGORY_IDS.includes(body.category as CategoryId)
    ? (body.category as CategoryId)
    : "telegram-bots";
  const accent = ACCENTS.includes(body.accent as Accent)
    ? (body.accent as Accent)
    : "blue";

  const price = Math.max(0, Math.round(Number(body.price) || 0));

  return {
    slug,
    category,
    accent,
    badge: String(body.badge ?? "NEW").trim().toUpperCase().slice(0, 10),
    title,
    tagline: String(body.tagline ?? "").trim(),
    description: String(body.description ?? "").trim(),
    thumbColor: String(body.thumbColor ?? "").trim() || "00F0FF",
    thumbText: String(body.thumbText ?? "").trim() || slug,
    image: String(body.image ?? "").trim() || undefined,
    fileUrl: String(body.fileUrl ?? "").trim() || undefined,
    fileName: String(body.fileName ?? "").trim() || undefined,
    title_en: String(body.title_en ?? "").trim() || undefined,
    tagline_en: String(body.tagline_en ?? "").trim() || undefined,
    description_en: String(body.description_en ?? "").trim() || undefined,
    features_en: toLines(body.features_en).length
      ? toLines(body.features_en)
      : undefined,
    whatsIncluded_en: toLines(body.whatsIncluded_en).length
      ? toLines(body.whatsIncluded_en)
      : undefined,
    envFields: normalizeEnvFields(body.envFields),
    price,
    currency: "USD",
    delivery: String(body.delivery ?? "").trim() || "1 день",
    warranty: String(body.warranty ?? "").trim() || "3 міс. саппорту",
    stack: toLines(body.stack),
    features: toLines(body.features),
    whatsIncluded: toLines(body.whatsIncluded).length
      ? toLines(body.whatsIncluded)
      : ["Повний вихідний код", "Інструкція по встановленню"],
    sold: Math.max(0, Math.round(Number(body.sold) || 0)),
    rating: Math.min(5, Math.max(0, Number(body.rating) || 5)),
    ratingCount: Math.max(0, Math.round(Number(body.ratingCount) || 0)),
  };
}
