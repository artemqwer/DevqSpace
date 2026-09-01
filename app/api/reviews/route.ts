import { randomUUID } from "crypto";
import {
  addReview,
  consumeReviewToken,
  getOrderByReviewToken,
  getProductBySlug,
  rateLimit,
  type Review,
} from "@/lib/store";

// Приймає відгук з двох шляхів:
//  - з одноразовим токеном із листа після видачі -> verified, публікується одразу
//  - з відкритої форми на сторінці товару -> у премодерацію
//
// Відкритий шлях під тим самим rateLimit і honeypot, що й форма замовлення.

const MAX_TEXT = 2000;
const MIN_TEXT = 20;

type Body = {
  productSlug?: string;
  authorName?: string;
  rating?: unknown;
  text?: string;
  token?: string;
  company?: string; // honeypot
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  // Бот заповнив приховане поле — вдаємо успіх, щоб не підказувати механіку.
  if (body.company && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await rateLimit(`review:${ip}`, 5, 60 * 10);
  if (!allowed) {
    return Response.json(
      { ok: false, error: "Забагато спроб. Спробуйте за 10 хвилин." },
      { status: 429 },
    );
  }

  const authorName = (body.authorName ?? "").trim().slice(0, 60);
  const text = (body.text ?? "").trim().slice(0, MAX_TEXT);
  const rating = Math.round(Number(body.rating));

  if (!authorName) {
    return Response.json({ ok: false, error: "Вкажіть ім'я" }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return Response.json({ ok: false, error: "Оцінка — від 1 до 5" }, { status: 400 });
  }
  if (text.length < MIN_TEXT) {
    return Response.json(
      { ok: false, error: `Опишіть враження хоча б у ${MIN_TEXT} символах` },
      { status: 400 },
    );
  }

  // Токен вирішує і товар, і статус — його не можна підмінити тілом запиту.
  let productSlug = (body.productSlug ?? "").trim();
  let orderId: string | undefined;
  let verified = false;

  if (body.token) {
    const order = await getOrderByReviewToken(body.token.trim());
    if (!order || !order.productSlug) {
      return Response.json(
        { ok: false, error: "Посилання недійсне або вже використане" },
        { status: 400 },
      );
    }
    productSlug = order.productSlug;
    orderId = order.id;
    verified = true;
  }

  if (!(await getProductBySlug(productSlug))) {
    return Response.json({ ok: false, error: "Товар не знайдено" }, { status: 404 });
  }

  const review: Review = {
    id: randomUUID().replace(/-/g, "").slice(0, 16),
    productSlug,
    orderId,
    authorName,
    rating,
    text,
    verified,
    status: verified ? "published" : "pending",
    createdAt: Date.now(),
  };

  await addReview(review);
  if (body.token) await consumeReviewToken(body.token.trim());

  return Response.json({ ok: true, verified });
}
