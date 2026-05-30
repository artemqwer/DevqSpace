import "server-only";
import { getCache, setCache } from "./store";

// Monobank "банка" — оплата карткою без ФОП. Без API/вебхука:
// клієнт переказує на банку, адмін підтверджує вручну (1 тап).

const JAR_URL = process.env.MONOBANK_JAR_URL;
const FALLBACK_RATE = Number(process.env.USD_UAH_RATE) || 42;

export function jarEnabled(): boolean {
  return Boolean(JAR_URL);
}

export function getJarUrl(): string | null {
  return JAR_URL ?? null;
}

// ---- Живий курс USD→UAH (Monobank → НБУ → env) ----------------------

const RATE_CACHE_KEY = "rate:usd_uah";
const RATE_TTL = 3600; // 1 год

type MonoCurrency = {
  currencyCodeA: number;
  currencyCodeB: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
};

async function fetchFromMonobank(): Promise<number | null> {
  try {
    const r = await fetch("https://api.monobank.ua/bank/currency", {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return null;
    const arr = (await r.json()) as MonoCurrency[];
    // USD (840) / UAH (980)
    const usd = arr.find(
      (x) => x.currencyCodeA === 840 && x.currencyCodeB === 980,
    );
    const rate = usd?.rateSell ?? usd?.rateCross ?? usd?.rateBuy;
    return rate && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function fetchFromNbu(): Promise<number | null> {
  try {
    const r = await fetch(
      "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json",
      { cache: "no-store", signal: AbortSignal.timeout(4000) },
    );
    if (!r.ok) return null;
    const arr = (await r.json()) as { rate?: number }[];
    const rate = arr[0]?.rate;
    return rate && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

export async function getUsdUahRate(): Promise<number> {
  const cached = await getCache<number>(RATE_CACHE_KEY);
  if (cached && cached > 0) return cached;

  const live = (await fetchFromMonobank()) ?? (await fetchFromNbu());
  const rate = live ?? FALLBACK_RATE;
  await setCache(RATE_CACHE_KEY, rate, RATE_TTL);
  return rate;
}

export async function usdToUah(usd: number): Promise<number> {
  const rate = await getUsdUahRate();
  return Math.round(usd * rate);
}
