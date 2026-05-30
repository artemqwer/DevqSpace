import { getSession } from "@/lib/session";
import { saveProduct, deleteProduct, slugExists } from "@/lib/store";
import type { Accent, CategoryId, Product } from "@/lib/products";

const ACCENTS: Accent[] = ["blue", "purple", "pink", "green"];
const CATEGORIES: CategoryId[] = ["telegram-bots", "web", "mobile"];

function toLines(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string")
    return v
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildProduct(body: Record<string, unknown>): Product | null {
  const title = String(body.title ?? "").trim();
  if (!title) return null;

  const slug = (String(body.slug ?? "").trim() || slugify(title)).trim();
  if (!slug) return null;

  const category = CATEGORIES.includes(body.category as CategoryId)
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

// CREATE
export async function POST(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const product = buildProduct(body);
  if (!product)
    return Response.json(
      { ok: false, error: "Вкажіть назву товару" },
      { status: 400 },
    );

  if (await slugExists(product.slug)) {
    return Response.json(
      { ok: false, error: `Slug "${product.slug}" вже існує` },
      { status: 409 },
    );
  }

  await saveProduct(product);
  return Response.json({ ok: true, slug: product.slug });
}

// UPDATE
export async function PUT(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const product = buildProduct(body);
  if (!product)
    return Response.json(
      { ok: false, error: "Вкажіть назву товару" },
      { status: 400 },
    );

  await saveProduct(product);
  return Response.json({ ok: true, slug: product.slug });
}

// DELETE
export async function DELETE(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return Response.json({ ok: false }, { status: 400 });
  await deleteProduct(slug);
  return Response.json({ ok: true });
}
