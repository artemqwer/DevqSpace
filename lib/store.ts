import "server-only";
import { Redis } from "@upstash/redis";
import { PRODUCTS as SEED_PRODUCTS, type Product } from "./products";

// =====================================================================
// Data store — Upstash Redis with in-memory fallback (local dev / no env)
// =====================================================================

export type OrderStatus = "new" | "in_progress" | "done" | "rejected";

export type StoredOrder = {
  id: string;
  type: "product" | "custom";
  productSlug?: string;
  productTitle?: string;
  productPrice?: number;
  customType?: string;
  budget?: string;
  deadline?: string;
  name: string;
  contactMethod: "telegram" | "email" | "phone";
  contact: string;
  message: string;
  status: OrderStatus;
  createdAt: number;
  // Оплата
  payMethod?: "crypto" | "jar";
  paid?: boolean;
  paidAt?: number;
  invoiceId?: number;
  payAmount?: string;
  payAsset?: string;
  // Видача товару
  tgChatId?: number; // chat_id клієнта (прив'язується deep-link'ом бота)
  delivered?: boolean;
  deliveredAt?: number;
  deliveryChannel?: "telegram" | "email" | "manual";
  deliveryNote?: string; // напр. "клієнт ще не підключив Telegram"
  downloadToken?: string; // токен для захищеного посилання на завантаження
  envValues?: Record<string, string>; // значення конфігу (токен бота тощо)
  deliverFileUrl?: string; // персональний ZIP (з підставленим .env)
};

// ---- Redis client (lazy) --------------------------------------------

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

export function storageMode(): "redis" | "memory" {
  return getRedis() ? "redis" : "memory";
}

// ---- In-memory fallback (survives HMR via globalThis) ---------------

type MemDB = {
  products: Map<string, Product>;
  orders: Map<string, StoredOrder>;
  seeded: boolean;
  viewsTotal: Map<string, number>;
  viewsDaily: Map<string, Record<string, number>>; // slug -> { date: count }
};

const g = globalThis as unknown as { __nexusMem?: MemDB };

function mem(): MemDB {
  if (!g.__nexusMem) {
    g.__nexusMem = {
      products: new Map(),
      orders: new Map(),
      seeded: false,
      viewsTotal: new Map(),
      viewsDaily: new Map(),
    };
  }
  return g.__nexusMem;
}

// ---- Keys -----------------------------------------------------------

const K = {
  product: (slug: string) => `product:${slug}`,
  productSlugs: "products:slugs",
  order: (id: string) => `order:${id}`,
  orderIndex: "orders:index", // sorted set by createdAt
  dlToken: (t: string) => `dl:${t}`, // токен завантаження -> orderId
  viewsIndex: "views:index", // sorted set: slug -> total views (для рейтингу)
  viewsDaily: (slug: string) => `views:daily:${slug}`, // hash: YYYY-MM-DD -> count
  viewsTotalAll: "views:total", // глобальний лічильник усіх переглядів
  adminsExtra: "admins:extra", // set додаткових chat_id адмінів
  adminInvite: (t: string) => `admininvite:${t}`, // одноразове запрошення
};

// ---- Seeding --------------------------------------------------------

async function ensureSeeded(): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    if (!m.seeded) {
      for (const p of SEED_PRODUCTS) m.products.set(p.slug, { ...p });
      m.seeded = true;
    }
    return;
  }
  const count = await redis.scard(K.productSlugs);
  if (count && count > 0) return;
  const pipe = redis.pipeline();
  for (const p of SEED_PRODUCTS) {
    pipe.set(K.product(p.slug), p);
    pipe.sadd(K.productSlugs, p.slug);
  }
  await pipe.exec();
}

// =====================================================================
// Products
// =====================================================================

export async function getAllProducts(): Promise<Product[]> {
  await ensureSeeded();
  const redis = getRedis();
  if (!redis) {
    return [...mem().products.values()];
  }
  const slugs = await redis.smembers(K.productSlugs);
  if (!slugs.length) return [];
  const keys = slugs.map((s) => K.product(s));
  const rows = await redis.mget<Product[]>(...keys);
  return rows.filter((r): r is Product => Boolean(r));
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  await ensureSeeded();
  const redis = getRedis();
  if (!redis) return mem().products.get(slug) ?? null;
  const p = await redis.get<Product>(K.product(slug));
  return p ?? null;
}

export async function saveProduct(product: Product): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().products.set(product.slug, { ...product });
    return;
  }
  const pipe = redis.pipeline();
  pipe.set(K.product(product.slug), product);
  pipe.sadd(K.productSlugs, product.slug);
  await pipe.exec();
}

export async function deleteProduct(slug: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    m.products.delete(slug);
    m.viewsTotal.delete(slug);
    m.viewsDaily.delete(slug);
    return;
  }
  const pipe = redis.pipeline();
  pipe.del(K.product(slug));
  pipe.srem(K.productSlugs, slug);
  pipe.zrem(K.viewsIndex, slug);
  pipe.del(K.viewsDaily(slug));
  await pipe.exec();
}

// Повне перезаповнення каталогу з lib/products.ts (SEED_PRODUCTS).
// УВАГА: видаляє всі поточні товари (в т.ч. додані вручну) і ставить стандартні.
export async function reseedProducts(): Promise<number> {
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    m.products.clear();
    for (const p of SEED_PRODUCTS) m.products.set(p.slug, { ...p });
    m.seeded = true;
    return SEED_PRODUCTS.length;
  }
  const slugs = await redis.smembers(K.productSlugs);
  const wipe = redis.pipeline();
  for (const s of slugs) wipe.del(K.product(s));
  wipe.del(K.productSlugs);
  await wipe.exec();

  const seed = redis.pipeline();
  for (const p of SEED_PRODUCTS) {
    seed.set(K.product(p.slug), p);
    seed.sadd(K.productSlugs, p.slug);
  }
  await seed.exec();
  return SEED_PRODUCTS.length;
}

export async function slugExists(slug: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return mem().products.has(slug);
  return (await redis.sismember(K.productSlugs, slug)) === 1;
}

// =====================================================================
// Orders
// =====================================================================

export async function addOrder(
  data: Omit<StoredOrder, "id" | "status" | "createdAt">,
): Promise<StoredOrder> {
  const order: StoredOrder = {
    ...data,
    id: genId(),
    status: "new",
    createdAt: Date.now(),
  };
  const redis = getRedis();
  if (!redis) {
    mem().orders.set(order.id, order);
    return order;
  }
  const pipe = redis.pipeline();
  pipe.set(K.order(order.id), order);
  pipe.zadd(K.orderIndex, { score: order.createdAt, member: order.id });
  await pipe.exec();
  return order;
}

export async function getAllOrders(): Promise<StoredOrder[]> {
  const redis = getRedis();
  if (!redis) {
    return [...mem().orders.values()].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }
  const ids = await redis.zrange<string[]>(K.orderIndex, 0, -1, {
    rev: true,
  });
  if (!ids.length) return [];
  const keys = ids.map((id) => K.order(id));
  const rows = await redis.mget<StoredOrder[]>(...keys);
  return rows.filter((r): r is StoredOrder => Boolean(r));
}

export async function getOrder(id: string): Promise<StoredOrder | null> {
  const redis = getRedis();
  if (!redis) return mem().orders.get(id) ?? null;
  return (await redis.get<StoredOrder>(K.order(id))) ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<boolean> {
  const order = await getOrder(id);
  if (!order) return false;
  order.status = status;
  const redis = getRedis();
  if (!redis) {
    mem().orders.set(id, order);
    return true;
  }
  await redis.set(K.order(id), order);
  return true;
}

export async function markOrderPaid(
  id: string,
  info: { invoiceId?: number; amount?: string; asset?: string },
): Promise<boolean> {
  const order = await getOrder(id);
  if (!order) return false;
  order.paid = true;
  order.paidAt = Date.now();
  if (info.invoiceId !== undefined) order.invoiceId = info.invoiceId;
  if (info.amount) order.payAmount = info.amount;
  if (info.asset) order.payAsset = info.asset;
  // Оплачене замовлення автоматично переходить "в роботу"
  if (order.status === "new") order.status = "in_progress";
  const redis = getRedis();
  if (!redis) {
    mem().orders.set(id, order);
    return true;
  }
  await redis.set(K.order(id), order);
  return true;
}

export async function setOrderInvoice(
  id: string,
  invoiceId: number,
): Promise<void> {
  const order = await getOrder(id);
  if (!order) return;
  order.invoiceId = invoiceId;
  const redis = getRedis();
  if (!redis) {
    mem().orders.set(id, order);
    return;
  }
  await redis.set(K.order(id), order);
}

// Прив'язує chat_id клієнта до замовлення (deep-link бота).
export async function setOrderTgChat(
  id: string,
  chatId: number,
): Promise<boolean> {
  const order = await getOrder(id);
  if (!order) return false;
  order.tgChatId = chatId;
  const redis = getRedis();
  if (!redis) mem().orders.set(id, order);
  else await redis.set(K.order(id), order);
  return true;
}

// Токен захищеного завантаження: order.downloadToken + індекс dl:token->id.
const memTokens = new Map<string, string>();

export async function setOrderDownloadToken(
  id: string,
  token: string,
  ttlSec = 60 * 60 * 24 * 60,
): Promise<void> {
  const order = await getOrder(id);
  if (!order) return;
  order.downloadToken = token;
  const redis = getRedis();
  if (!redis) {
    mem().orders.set(id, order);
    memTokens.set(token, id);
    return;
  }
  await redis.set(K.order(id), order);
  await redis.set(K.dlToken(token), id, { ex: ttlSec });
}

export async function getOrderByToken(
  token: string,
): Promise<StoredOrder | null> {
  const redis = getRedis();
  const id = redis
    ? await redis.get<string>(K.dlToken(token))
    : memTokens.get(token);
  if (!id) return null;
  return getOrder(id);
}

// Зберігає URL персонального (пропатченого) ZIP на замовленні.
export async function setOrderDeliverFile(
  id: string,
  url: string,
): Promise<void> {
  const order = await getOrder(id);
  if (!order) return;
  order.deliverFileUrl = url;
  const redis = getRedis();
  if (!redis) mem().orders.set(id, order);
  else await redis.set(K.order(id), order);
}

export async function markOrderDelivered(
  id: string,
  channel: NonNullable<StoredOrder["deliveryChannel"]>,
  note?: string,
): Promise<void> {
  const order = await getOrder(id);
  if (!order) return;
  order.delivered = channel !== "manual";
  order.deliveredAt = Date.now();
  order.deliveryChannel = channel;
  if (note) order.deliveryNote = note;
  const redis = getRedis();
  if (!redis) mem().orders.set(id, order);
  else await redis.set(K.order(id), order);
}

export async function deleteOrder(id: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().orders.delete(id);
    return;
  }
  const pipe = redis.pipeline();
  pipe.del(K.order(id));
  pipe.zrem(K.orderIndex, id);
  await pipe.exec();
}

// =====================================================================
// Product views / analytics
// =====================================================================

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10));
  }
  return out;
}

// Реєструє один перегляд товару. Викликається зі сторінки товару через
// after() — не блокує рендер. Веде і сумарний лічильник (для рейтингу),
// і розбивку по днях (для трендів).
export async function trackProductView(slug: string): Promise<void> {
  const day = today();
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    m.viewsTotal.set(slug, (m.viewsTotal.get(slug) ?? 0) + 1);
    const daily = m.viewsDaily.get(slug) ?? {};
    daily[day] = (daily[day] ?? 0) + 1;
    m.viewsDaily.set(slug, daily);
    return;
  }
  const pipe = redis.pipeline();
  pipe.zincrby(K.viewsIndex, 1, slug);
  pipe.hincrby(K.viewsDaily(slug), day, 1);
  pipe.incr(K.viewsTotalAll);
  await pipe.exec();
}

// Загальна к-сть переглядів по всьому каталогу (O(1) лічильник).
export async function getTotalViews(): Promise<number> {
  const redis = getRedis();
  if (!redis) {
    let sum = 0;
    for (const v of mem().viewsTotal.values()) sum += v;
    return sum;
  }
  return Number((await redis.get<number>(K.viewsTotalAll)) ?? 0);
}

export type ProductViews = {
  total: number;
  last7: number;
  last30: number;
  today: number;
  daily: Record<string, number>;
};

function summarizeViews(
  total: number,
  daily: Record<string, number>,
): ProductViews {
  const d7 = new Set(lastNDates(7));
  const d30 = new Set(lastNDates(30));
  let last7 = 0;
  let last30 = 0;
  for (const [date, count] of Object.entries(daily)) {
    if (d7.has(date)) last7 += count;
    if (d30.has(date)) last30 += count;
  }
  return { total, last7, last30, today: daily[today()] ?? 0, daily };
}

export async function getProductViews(slug: string): Promise<ProductViews> {
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    return summarizeViews(
      m.viewsTotal.get(slug) ?? 0,
      m.viewsDaily.get(slug) ?? {},
    );
  }
  const [total, daily] = await Promise.all([
    redis.zscore(K.viewsIndex, slug),
    redis.hgetall<Record<string, number>>(K.viewsDaily(slug)),
  ]);
  return summarizeViews(Number(total ?? 0), daily ?? {});
}

// Рейтинг товарів за сумарними переглядами (спадання).
export async function getViewsRanking(
  limit = 20,
): Promise<{ slug: string; views: number }[]> {
  const redis = getRedis();
  if (!redis) {
    return [...mem().viewsTotal.entries()]
      .map(([slug, views]) => ({ slug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }
  const rows = await redis.zrange<(string | number)[]>(
    K.viewsIndex,
    0,
    limit - 1,
    { rev: true, withScores: true },
  );
  const out: { slug: string; views: number }[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    out.push({ slug: String(rows[i]), views: Number(rows[i + 1]) });
  }
  return out;
}

// Метрики товару, пораховані із замовлень (кількість, оплати, виторг).
export type ProductOrderStats = {
  orders: number;
  paid: number;
  paidRevenue: number;
  doneRevenue: number;
};

// Повна аналітика по одному товару: сам товар + перегляди + продажі.
export type ProductAnalytics = {
  product: Product;
  views: ProductViews;
  orderStats: ProductOrderStats;
  conversion: number; // % переглядів, що стали замовленнями
};

export async function getProductAnalytics(
  slug: string,
): Promise<ProductAnalytics | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const [views, orders] = await Promise.all([
    getProductViews(slug),
    getAllOrders(),
  ]);

  const orderStats: ProductOrderStats = {
    orders: 0,
    paid: 0,
    paidRevenue: 0,
    doneRevenue: 0,
  };
  for (const o of orders) {
    if (o.type !== "product" || o.productSlug !== slug) continue;
    orderStats.orders++;
    if (o.paid) {
      orderStats.paid++;
      if (o.productPrice) orderStats.paidRevenue += o.productPrice;
    }
    if (o.status === "done" && o.productPrice) {
      orderStats.doneRevenue += o.productPrice;
    }
  }

  const conversion =
    views.total > 0 ? (orderStats.orders / views.total) * 100 : 0;

  return { product, views, orderStats, conversion };
}

// Агрегат для міні-аппки: тотали + список товарів з переглядами й продажами.
// Дешево по Redis: 1 запит на список товарів, 1 на рейтинг переглядів,
// 1 на замовлення — далі мерджимо в пам'яті.
export type MiniAppProduct = {
  slug: string;
  title: string;
  price: number;
  category: string;
  accent: string;
  image?: string;
  views: number;
  orders: number;
  paid: number;
  revenue: number;
};

export type MiniAppOverview = {
  totals: {
    views: number;
    products: number;
    orders: number;
    ordersLast7: number;
    paidRevenue: number;
    doneRevenue: number;
    newOrders: number;
  };
  products: MiniAppProduct[];
};

export async function getMiniAppOverview(): Promise<MiniAppOverview> {
  const [products, ranking, orders, totalViews] = await Promise.all([
    getAllProducts(),
    getViewsRanking(10000),
    getAllOrders(),
    getTotalViews(),
  ]);

  const viewsBySlug = new Map(ranking.map((r) => [r.slug, r.views]));

  type Agg = { orders: number; paid: number; revenue: number };
  const orderAgg = new Map<string, Agg>();
  const weekAgo = Date.now() - 7 * 86400000;
  let ordersLast7 = 0;
  let paidRevenue = 0;
  let doneRevenue = 0;
  let newOrders = 0;

  for (const o of orders) {
    if (o.createdAt >= weekAgo) ordersLast7++;
    if (o.status === "new") newOrders++;
    if (o.paid && o.productPrice) paidRevenue += o.productPrice;
    if (o.status === "done" && o.type === "product" && o.productPrice)
      doneRevenue += o.productPrice;

    if (o.type !== "product" || !o.productSlug) continue;
    const a = orderAgg.get(o.productSlug) ?? { orders: 0, paid: 0, revenue: 0 };
    a.orders++;
    if (o.paid) {
      a.paid++;
      if (o.productPrice) a.revenue += o.productPrice;
    }
    orderAgg.set(o.productSlug, a);
  }

  const list: MiniAppProduct[] = products.map((p) => {
    const a = orderAgg.get(p.slug) ?? { orders: 0, paid: 0, revenue: 0 };
    return {
      slug: p.slug,
      title: p.title,
      price: p.price,
      category: p.category,
      accent: p.accent,
      image: p.image,
      views: viewsBySlug.get(p.slug) ?? 0,
      orders: a.orders,
      paid: a.paid,
      revenue: a.revenue,
    };
  });
  list.sort((a, b) => b.views - a.views);

  return {
    totals: {
      views: totalViews,
      products: products.length,
      orders: orders.length,
      ordersLast7,
      paidRevenue,
      doneRevenue,
      newOrders,
    },
    products: list,
  };
}

// =====================================================================
// Stats
// =====================================================================

export type Stats = {
  total: number;
  byStatus: Record<OrderStatus, number>;
  byType: { product: number; custom: number };
  revenueEstimate: number; // сума цін закритих продуктових замовлень
  paidRevenue: number; // сума фактично оплачених замовлень
  paidCount: number;
  last7days: number;
  topProducts: { title: string; count: number }[];
};

export async function getStats(): Promise<Stats> {
  const orders = await getAllOrders();
  const byStatus: Record<OrderStatus, number> = {
    new: 0,
    in_progress: 0,
    done: 0,
    rejected: 0,
  };
  const byType = { product: 0, custom: 0 };
  let revenueEstimate = 0;
  let paidRevenue = 0;
  let paidCount = 0;
  let last7days = 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const titleCount = new Map<string, number>();

  for (const o of orders) {
    byStatus[o.status]++;
    byType[o.type]++;
    if (o.createdAt >= weekAgo) last7days++;
    if (o.type === "product" && o.status === "done" && o.productPrice) {
      revenueEstimate += o.productPrice;
    }
    if (o.paid && o.productPrice) {
      paidRevenue += o.productPrice;
      paidCount++;
    }
    if (o.type === "product" && o.productTitle) {
      titleCount.set(
        o.productTitle,
        (titleCount.get(o.productTitle) ?? 0) + 1,
      );
    }
  }

  const topProducts = [...titleCount.entries()]
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: orders.length,
    byStatus,
    byType,
    revenueEstimate,
    paidRevenue,
    paidCount,
    last7days,
    topProducts,
  };
}

// =====================================================================
// Rate limiting (Redis INCR + EXPIRE, in-memory fallback)
// =====================================================================

const memHits = new Map<string, { count: number; resetAt: number }>();

/**
 * Повертає true якщо запит дозволено, false якщо ліміт вичерпано.
 * limit — к-сть запитів за windowSec секунд для одного ключа.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const redis = getRedis();
  const rk = `rl:${key}`;

  if (!redis) {
    const now = Date.now();
    const cur = memHits.get(rk);
    if (!cur || cur.resetAt < now) {
      memHits.set(rk, { count: 1, resetAt: now + windowSec * 1000 });
      return true;
    }
    cur.count++;
    return cur.count <= limit;
  }

  const count = await redis.incr(rk);
  if (count === 1) await redis.expire(rk, windowSec);
  return count <= limit;
}

// =====================================================================
// Generic cache (Redis з TTL + in-memory fallback)
// =====================================================================

const memCache = new Map<string, { value: unknown; expireAt: number }>();

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) {
    const c = memCache.get(key);
    if (!c || c.expireAt < Date.now()) return null;
    return c.value as T;
  }
  return (await redis.get<T>(`cache:${key}`)) ?? null;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSec: number,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memCache.set(key, { value, expireAt: Date.now() + ttlSec * 1000 });
    return;
  }
  await redis.set(`cache:${key}`, value, { ex: ttlSec });
}

// =====================================================================
// Додаткові адміни бота (окрім головного з env) + запрошення
// =====================================================================

const memAdmins = new Set<number>();
const memInvites = new Map<string, number>(); // token -> expireAt

export async function addExtraAdmin(chatId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memAdmins.add(chatId);
    return;
  }
  await redis.sadd(K.adminsExtra, chatId);
}

export async function removeExtraAdmin(chatId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memAdmins.delete(chatId);
    return;
  }
  await redis.srem(K.adminsExtra, chatId);
}

export async function getExtraAdmins(): Promise<number[]> {
  const redis = getRedis();
  if (!redis) return [...memAdmins];
  const ids = await redis.smembers(K.adminsExtra);
  return ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
}

export async function isExtraAdmin(chatId: number | string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return memAdmins.has(Number(chatId));
  return (await redis.sismember(K.adminsExtra, Number(chatId))) === 1;
}

// Одноразове запрошення-токен для видачі доступу адміна.
export async function createAdminInvite(
  token: string,
  ttlSec = 60 * 60 * 24,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memInvites.set(token, Date.now() + ttlSec * 1000);
    return;
  }
  await redis.set(K.adminInvite(token), "1", { ex: ttlSec });
}

export async function consumeAdminInvite(token: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const exp = memInvites.get(token);
    if (!exp || exp < Date.now()) return false;
    memInvites.delete(token);
    return true;
  }
  const v = await redis.get(K.adminInvite(token));
  if (!v) return false;
  await redis.del(K.adminInvite(token));
  return true;
}

// ---- utils ----------------------------------------------------------

function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}
