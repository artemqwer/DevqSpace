import type { Accent, CategoryId, Product } from "./products";

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

// env-поля: рядки виду "KEY | Назва" (або масив об'єктів). Ключ ліворуч.
export function parseEnvFields(
  v: unknown,
): { key: string; label: string }[] | undefined {
  let lines: string[] = [];
  if (Array.isArray(v)) {
    const arr = v
      .map((x) =>
        typeof x === "object" && x
          ? { key: String((x as Record<string, unknown>).key ?? "").trim(), label: String((x as Record<string, unknown>).label ?? "").trim() }
          : null,
      )
      .filter((x): x is { key: string; label: string } => Boolean(x && x.key));
    return arr.length ? arr : undefined;
  }
  if (typeof v === "string") lines = v.split("\n");
  const out = lines
    .map((line) => {
      const [k, l] = line.split("|");
      const key = (k ?? "").trim();
      return key ? { key, label: (l ?? "").trim() || key } : null;
    })
    .filter((x): x is { key: string; label: string } => Boolean(x));
  return out.length ? out : undefined;
}

export function slugify(s: string): string {
  return transliterate(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
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
    envFields: parseEnvFields(body.envFields),
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
