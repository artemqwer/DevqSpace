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
};

const g = globalThis as unknown as { __nexusMem?: MemDB };

function mem(): MemDB {
  if (!g.__nexusMem) {
    g.__nexusMem = { products: new Map(), orders: new Map(), seeded: false };
  }
  return g.__nexusMem;
}

// ---- Keys -----------------------------------------------------------

const K = {
  product: (slug: string) => `product:${slug}`,
  productSlugs: "products:slugs",
  order: (id: string) => `order:${id}`,
  orderIndex: "orders:index", // sorted set by createdAt
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
    mem().products.delete(slug);
    return;
  }
  const pipe = redis.pipeline();
  pipe.del(K.product(slug));
  pipe.srem(K.productSlugs, slug);
  await pipe.exec();
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
// Stats
// =====================================================================

export type Stats = {
  total: number;
  byStatus: Record<OrderStatus, number>;
  byType: { product: number; custom: number };
  revenueEstimate: number; // сума цін продуктових замовлень зі статусом done
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

// ---- utils ----------------------------------------------------------

function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}
