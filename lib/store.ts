import "server-only";
import { Redis } from "@upstash/redis";
import {
  PRODUCTS as SEED_PRODUCTS,
  roundCounter,
  type Product,
} from "./products";
import { DEV_STUBS } from "./devStubs";
import { devReadState, devWriteState } from "./devStorage";

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
  // Динамічна упаковка
  envData?: string; // значення .env клієнта, зашифровані AES-256-GCM
  envDataAt?: number; // коли збережено — для чистки через 30 днів
  deliveryStatus?: DeliveryStatus;
  errorMessage?: string; // причина FAILED, для адмінки
  packageUrl?: string; // згенерований персональний архів
  packageName?: string;
  // Замовлення, створені до злиття гілок, тримали персональний архів тут.
  // Читаємо для сумісності, нові пишемо тільки в packageUrl.
  deliverFileUrl?: string;
};

// Статус збірки й видачі персонального архіву. Доповнює старі delivered /
// deliveryChannel, на які зав'язані бот і адмінка, — вони лишаються як були.
export type DeliveryStatus = "PENDING" | "GENERATING" | "SENT" | "FAILED";

// Відгук. Два шляхи: з листа після видачі (verified, публікується одразу)
// і з форми на сторінці товару (премодерація) — фальшиві «5 зірок» на
// новому магазині шкодять більше, ніж їх відсутність.
export type ReviewStatus = "pending" | "published" | "hidden";

export type Review = {
  id: string;
  productSlug: string;
  orderId?: string;
  authorName: string;
  rating: number; // 1..5
  text: string;
  verified: boolean;
  status: ReviewStatus;
  createdAt: number;
  reply?: { text: string; at: number };
};

// Для замовлень, створених до появи поля.
export function effectiveDeliveryStatus(order: StoredOrder): DeliveryStatus {
  if (order.deliveryStatus) return order.deliveryStatus;
  return order.delivered ? "SENT" : "PENDING";
}

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
//
// Локально, без Upstash, це і є база. Щоб замовлення й товари не зникали при
// кожному перезапуску dev-сервера (у проді Redis їх зберігає), стан
// дзеркалиться у .devq-storage/db.json. У проді персист не вмикається.

type MemDB = {
  products: Map<string, Product>;
  orders: Map<string, StoredOrder>;
  seeded: boolean;
  viewsTotal: Map<string, number>;
  viewsDaily: Map<string, Record<string, number>>; // slug -> { date: count }
  tokens: Map<string, string>; // downloadToken -> orderId
  admins: Set<number>; // додаткові адміни бота
  invites: Map<string, number>; // token -> expireAt
  content: Map<string, Record<string, string>>; // locale -> { "hero.title": "..." }
  counters: Map<string, number>; // офлайнові добавки до лічильників на сайті
  settings: Map<string, string>; // налаштування сайту (контакти, реквізити)
  reviews: Map<string, Review>;
  reviewTokens: Map<string, string>; // одноразовий токен -> orderId
};

const g = globalThis as unknown as {
  __nexusMem?: MemDB;
  __nexusMemTimer?: ReturnType<typeof setTimeout>;
};

const DB_FILE = "db.json";

type MemSnapshot = {
  products: [string, Product][];
  orders: [string, StoredOrder][];
  seeded: boolean;
  viewsTotal: [string, number][];
  viewsDaily: [string, Record<string, number>][];
  tokens: [string, string][];
  admins: number[];
  invites: [string, number][];
  content: [string, Record<string, string>][];
  counters: [string, number][];
  settings: [string, string][];
  reviews: [string, Review][];
  reviewTokens: [string, string][];
};

function emptyMem(): MemDB {
  return {
    products: new Map(),
    orders: new Map(),
    seeded: false,
    viewsTotal: new Map(),
    viewsDaily: new Map(),
    tokens: new Map(),
    admins: new Set(),
    invites: new Map(),
    content: new Map(),
    counters: new Map(),
    settings: new Map(),
    reviews: new Map(),
    reviewTokens: new Map(),
  };
}

function hydrate(): MemDB {
  const db = emptyMem();
  if (!DEV_STUBS) return db;
  const raw = devReadState(DB_FILE) as MemSnapshot | null;
  if (!raw) return db;
  try {
    db.products = new Map(raw.products ?? []);
    db.orders = new Map(raw.orders ?? []);
    db.seeded = Boolean(raw.seeded);
    db.viewsTotal = new Map(raw.viewsTotal ?? []);
    db.viewsDaily = new Map(raw.viewsDaily ?? []);
    db.tokens = new Map(raw.tokens ?? []);
    db.admins = new Set(raw.admins ?? []);
    db.invites = new Map(raw.invites ?? []);
    db.content = new Map(raw.content ?? []);
    db.counters = new Map(raw.counters ?? []);
    db.settings = new Map(raw.settings ?? []);
    db.reviews = new Map(raw.reviews ?? []);
    db.reviewTokens = new Map(raw.reviewTokens ?? []);
  } catch {
    return emptyMem();
  }
  return db;
}

function mem(): MemDB {
  if (!g.__nexusMem) g.__nexusMem = hydrate();
  return g.__nexusMem;
}

// Позначає стан зміненим. Запис на диск дебаунситься, щоб пачка мутацій
// (напр. pipeline при reseed) не породжувала десятки записів підряд.
function touch(): void {
  if (!DEV_STUBS) return;
  if (g.__nexusMemTimer) clearTimeout(g.__nexusMemTimer);
  g.__nexusMemTimer = setTimeout(() => {
    const m = mem();
    const snapshot: MemSnapshot = {
      products: [...m.products.entries()],
      orders: [...m.orders.entries()],
      seeded: m.seeded,
      viewsTotal: [...m.viewsTotal.entries()],
      viewsDaily: [...m.viewsDaily.entries()],
      tokens: [...m.tokens.entries()],
      admins: [...m.admins],
      invites: [...m.invites.entries()],
      content: [...m.content.entries()],
      counters: [...m.counters.entries()],
      settings: [...m.settings.entries()],
      reviews: [...m.reviews.entries()],
      reviewTokens: [...m.reviewTokens.entries()],
    };
    try {
      devWriteState(DB_FILE, snapshot);
    } catch (e) {
      console.error("[store] dev persist failed:", e);
    }
  }, 300);
  // Не тримає процес живим заради запису.
  g.__nexusMemTimer.unref?.();
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
  content: (locale: string) => `content:${locale}`, // hash: "hero.title" -> текст
  counters: "counters", // hash: products / clients -> офлайнова добавка
  settings: "settings", // hash: налаштування сайту
  review: (id: string) => `review:${id}`,
  reviewIndex: "reviews:index", // sorted set за createdAt
  reviewToken: (t: string) => `reviewtoken:${t}`, // одноразовий токен -> orderId
};

// ---- Seeding --------------------------------------------------------

async function ensureSeeded(): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    if (!m.seeded) {
      // Тільки відсутні slug'и. Раніше сід перезаписував усе підряд, і товар,
      // збережений адміном до першого читання, мовчки відкочувався до версії
      // з lib/products.ts (saveProduct не виставляє прапорець seeded).
      // На Redis такого не буває: після saveProduct scard > 0 і сід не йде.
      for (const p of SEED_PRODUCTS) {
        if (!m.products.has(p.slug)) m.products.set(p.slug, { ...p });
      }
      m.seeded = true;
      touch();
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
    touch();
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
    touch();
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
    touch();
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
    touch();
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

// Часткове оновлення замовлення. Використовується для полів, які з'явилися
// разом з динамічною упаковкою (deliveryStatus, envData, packageUrl…), щоб не
// заводити окремий сеттер на кожне.
export async function updateOrder(
  id: string,
  patch: Partial<StoredOrder>,
): Promise<StoredOrder | null> {
  const order = await getOrder(id);
  if (!order) return null;
  const next = { ...order, ...patch, id: order.id };
  const redis = getRedis();
  if (!redis) {
    mem().orders.set(id, next);
    touch();
    return next;
  }
  await redis.set(K.order(id), next);
  return next;
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
    touch();
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
    touch();
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
    touch();
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
  if (!redis) {
    mem().orders.set(id, order);
    touch();
  } else await redis.set(K.order(id), order);
  return true;
}

// Токен захищеного завантаження: order.downloadToken + індекс dl:token->id.

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
    const m = mem();
    m.orders.set(id, order);
    m.tokens.set(token, id);
    touch();
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
    : mem().tokens.get(token);
  if (!id) return null;
  return getOrder(id);
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
  if (!redis) {
    mem().orders.set(id, order);
    touch();
  } else await redis.set(K.order(id), order);
}

// Введені клієнтом .env-значення (там його бойовий токен) не мають лежати
// вічно. Крона немає, тож чистимо ліниво — зі сторінки замовлень адмінки, яка
// й так рендериться на кожен запит. Після чистки перегенерація архіву стає
// неможливою, тому вікно широке.
export const ENV_DATA_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function purgeStaleEnvData(orders: StoredOrder[]): Promise<number> {
  const cutoff = Date.now() - ENV_DATA_TTL_MS;
  let purged = 0;
  for (const o of orders) {
    if (!o.envData) continue;
    const stamp = o.envDataAt ?? o.createdAt;
    if (stamp >= cutoff) continue;
    await updateOrder(o.id, { envData: undefined, envDataAt: undefined });
    o.envData = undefined;
    o.envDataAt = undefined;
    purged++;
  }
  return purged;
}

export async function deleteOrder(id: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().orders.delete(id);
    touch();
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
    touch();
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

// Реальні продажі й рейтинг по товарах. Продажі — оплачені замовлення плюс
// офлайнові, які адмін вніс руками; рейтинг — з опублікованих відгуків.
//
// ponytail: скан усіх замовлень, кеш 60 с. При тисячах замовлень знадобиться
// лічильник у Redis; на теперішньому обсязі це зайва складність.
type ProductStat = { sold: number; rating: number; ratingCount: number };

async function computeProductStats(): Promise<Record<string, ProductStat>> {
  const cached = await getCache<Record<string, ProductStat>>("productStats");
  if (cached) return cached;

  const [orders, reviews] = await Promise.all([getAllOrders(), getAllReviews()]);

  const paid = new Map<string, number>();
  for (const o of orders) {
    if (o.type !== "product" || !o.paid || !o.productSlug) continue;
    paid.set(o.productSlug, (paid.get(o.productSlug) ?? 0) + 1);
  }

  const sums = new Map<string, { total: number; count: number }>();
  for (const r of reviews) {
    if (r.status !== "published") continue;
    const cur = sums.get(r.productSlug) ?? { total: 0, count: 0 };
    cur.total += r.rating;
    cur.count += 1;
    sums.set(r.productSlug, cur);
  }

  const out: Record<string, ProductStat> = {};
  for (const slug of new Set([...paid.keys(), ...sums.keys()])) {
    const s = sums.get(slug);
    out[slug] = {
      sold: paid.get(slug) ?? 0,
      rating: s ? Math.round((s.total / s.count) * 10) / 10 : 0,
      ratingCount: s?.count ?? 0,
    };
  }

  await setCache("productStats", out, 60);
  return out;
}

// Товари, які бачить відвідувач. Фільтр і підстановка справжніх чисел саме
// тут, а не на кожній сторінці: інакше чернетка чи вигадана цифра рано чи
// пізно вилізуть там, де про них забули.
//
// Нуль означає «не показуємо»: продажі округлюються вниз до кратного 5, тож
// менше за 5 дає 0, а рейтингу без жодного відгуку не існує. «0 продано» на
// картці шкодить більше, ніж відсутність цифри.
export async function getPublicProducts(): Promise<Product[]> {
  const [products, stats] = await Promise.all([
    getAllProducts(),
    computeProductStats(),
  ]);

  return products
    .filter((p) => !p.hidden)
    .map((p) => {
      const s = stats[p.slug];
      const realSold = (s?.sold ?? 0) + (p.offlineSold ?? 0);
      return {
        ...p,
        sold: roundCounter(realSold),
        rating: s?.rating ?? 0,
        ratingCount: s?.ratingCount ?? 0,
      };
    });
}

export async function getMiniAppOverview(): Promise<MiniAppOverview> {
  const [products, ranking, orders, totalViews] = await Promise.all([
    // Аналітика власника: чернетки теж показуємо, це його дані.
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

export async function addExtraAdmin(chatId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().admins.add(chatId);
    touch();
    return;
  }
  await redis.sadd(K.adminsExtra, chatId);
}

export async function removeExtraAdmin(chatId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().admins.delete(chatId);
    touch();
    return;
  }
  await redis.srem(K.adminsExtra, chatId);
}

export async function getExtraAdmins(): Promise<number[]> {
  const redis = getRedis();
  if (!redis) return [...mem().admins];
  const ids = await redis.smembers(K.adminsExtra);
  return ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
}

export async function isExtraAdmin(chatId: number | string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return mem().admins.has(Number(chatId));
  return (await redis.sismember(K.adminsExtra, Number(chatId))) === 1;
}

// Одноразове запрошення-токен для видачі доступу адміна.
export async function createAdminInvite(
  token: string,
  ttlSec = 60 * 60 * 24,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().invites.set(token, Date.now() + ttlSec * 1000);
    touch();
    return;
  }
  await redis.set(K.adminInvite(token), "1", { ex: ttlSec });
}

export async function consumeAdminInvite(token: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const m = mem();
    const exp = m.invites.get(token);
    if (!exp || exp < Date.now()) return false;
    m.invites.delete(token);
    touch();
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

// =====================================================================
// Правки текстів сайту (перекривають messages/<locale>.json)
// =====================================================================
//
// Зберігаємо лише те, що адмін реально змінив, — плоскими ключами
// («hero.title»). Файли лишаються джерелом дефолтів: «скинути» = прибрати
// ключ звідси, і текст повертається до задеплоєного.

export async function getContentOverrides(
  locale: string,
): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return { ...(mem().content.get(locale) ?? {}) };
  return (await redis.hgetall<Record<string, string>>(K.content(locale))) ?? {};
}

// value === null прибирає правку (повернення до тексту з файлу).
export async function setContentOverrides(
  locale: string,
  patch: Record<string, string | null>,
): Promise<void> {
  const redis = getRedis();
  const set: Record<string, string> = {};
  const del: string[] = [];
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) del.push(key);
    else set[key] = value;
  }

  if (!redis) {
    const m = mem();
    const current = { ...(m.content.get(locale) ?? {}) };
    Object.assign(current, set);
    for (const key of del) delete current[key];
    m.content.set(locale, current);
    touch();
    return;
  }

  if (Object.keys(set).length) await redis.hset(K.content(locale), set);
  if (del.length) await redis.hdel(K.content(locale), ...del);
}

export async function resetContent(locale: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().content.delete(locale);
    touch();
    return;
  }
  await redis.del(K.content(locale));
}

// =====================================================================
// Лічильники на сайті («N продуктів · N клієнтів»)
// =====================================================================
//
// Показуємо реальні числа плюс офлайнову добавку, яку ставить адмін: продажі
// до появи сайту (Telegram, знайомі) — це чесна бухгалтерія, а не накрутка.
// Реальних клієнтів рахуємо за унікальним контактом серед оплачених
// замовлень: одна людина, що купила тричі, — це один клієнт.

export type OfflineCounters = { products: number; clients: number };
export type SiteCounters = {
  products: number; // те, що бачить відвідувач: округлено вниз до 5
  clients: number;
  totalProducts: number; // реальні + офлайнові, до округлення
  totalClients: number;
  realProducts: number; // з чого складається — щоб адмін бачив
  realClients: number;
  offline: OfflineCounters;
};

export async function getOfflineCounters(): Promise<OfflineCounters> {
  const redis = getRedis();
  const read = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };
  if (!redis) {
    const m = mem().counters;
    return { products: read(m.get("products")), clients: read(m.get("clients")) };
  }
  const raw =
    (await redis.hgetall<Record<string, unknown>>(K.counters)) ?? {};
  return { products: read(raw.products), clients: read(raw.clients) };
}

export async function setOfflineCounters(next: OfflineCounters): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    const m = mem().counters;
    m.set("products", next.products);
    m.set("clients", next.clients);
    touch();
    return;
  }
  await redis.hset(K.counters, { ...next });
}

export async function getSiteCounters(): Promise<SiteCounters> {
  const [products, orders, offline] = await Promise.all([
    getPublicProducts(),
    getAllOrders(),
    getOfflineCounters(),
  ]);

  const buyers = new Set<string>();
  for (const o of orders) {
    if (o.paid && o.contact) buyers.add(o.contact.trim().toLowerCase());
  }

  const totalProducts = products.length + offline.products;
  const totalClients = buyers.size + offline.clients;

  return {
    realProducts: products.length,
    realClients: buyers.size,
    offline,
    totalProducts,
    totalClients,
    products: roundCounter(totalProducts),
    clients: roundCounter(totalClients),
  };
}

// =====================================================================
// Налаштування сайту (контакт підтримки, реквізити, тумблери)
// =====================================================================
//
// Плоскі рядкові пари, як і правки текстів. Зберігаємо лише те, що адмін
// справді заповнив: порожнє значення прибирає ключ і повертає дефолт з коду.

export async function getSiteSettings(): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return Object.fromEntries(mem().settings);
  return (await redis.hgetall<Record<string, string>>(K.settings)) ?? {};
}

export async function setSiteSettings(
  patch: Record<string, string | null>,
): Promise<void> {
  const redis = getRedis();
  const set: Record<string, string> = {};
  const del: string[] = [];
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") del.push(key);
    else set[key] = value;
  }

  if (!redis) {
    const m = mem().settings;
    for (const [k, v] of Object.entries(set)) m.set(k, v);
    for (const k of del) m.delete(k);
    touch();
    return;
  }

  if (Object.keys(set).length) await redis.hset(K.settings, set);
  if (del.length) await redis.hdel(K.settings, ...del);
}

// =====================================================================
// Відгуки
// =====================================================================
//
// ponytail: індекс — один sorted set на всі відгуки, фільтрація за товаром
// і статусом у пам'яті. При тисячах відгуків знадобиться окремий набір на
// товар; на теперішньому обсязі це зайва складність.

export async function addReview(review: Review): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().reviews.set(review.id, review);
    touch();
    return;
  }
  await redis.set(K.review(review.id), review);
  await redis.zadd(K.reviewIndex, { score: review.createdAt, member: review.id });
}

export async function getAllReviews(): Promise<Review[]> {
  const redis = getRedis();
  if (!redis) {
    return [...mem().reviews.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
  const ids = await redis.zrange<string[]>(K.reviewIndex, 0, -1, { rev: true });
  if (!ids.length) return [];
  const rows = await redis.mget<Review[]>(...ids.map((id) => K.review(id)));
  return rows.filter((r): r is Review => Boolean(r));
}

export async function getPublishedReviews(slug: string): Promise<Review[]> {
  return (await getAllReviews()).filter(
    (r) => r.productSlug === slug && r.status === "published",
  );
}

export async function updateReview(
  id: string,
  patch: Partial<Review>,
): Promise<Review | null> {
  const redis = getRedis();
  const current = redis
    ? await redis.get<Review>(K.review(id))
    : (mem().reviews.get(id) ?? null);
  if (!current) return null;

  const next = { ...current, ...patch, id: current.id };
  if (!redis) {
    mem().reviews.set(id, next);
    touch();
    return next;
  }
  await redis.set(K.review(id), next);
  return next;
}

export async function deleteReview(id: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().reviews.delete(id);
    touch();
    return;
  }
  await redis.del(K.review(id));
  await redis.zrem(K.reviewIndex, id);
}

// Одноразове запрошення лишити відгук — видається разом із товаром.
export async function setReviewToken(
  token: string,
  orderId: string,
  ttlSec = 60 * 60 * 24 * 90,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().reviewTokens.set(token, orderId);
    touch();
    return;
  }
  await redis.set(K.reviewToken(token), orderId, { ex: ttlSec });
}

export async function getOrderByReviewToken(
  token: string,
): Promise<StoredOrder | null> {
  const redis = getRedis();
  const id = redis
    ? await redis.get<string>(K.reviewToken(token))
    : mem().reviewTokens.get(token);
  if (!id) return null;
  return getOrder(id);
}

// Токен одноразовий: погашаємо після успішного відгуку.
export async function consumeReviewToken(token: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem().reviewTokens.delete(token);
    touch();
    return;
  }
  await redis.del(K.reviewToken(token));
}
