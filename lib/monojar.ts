// Monobank "банка" — оплата карткою без ФОП. Без API/вебхука:
// клієнт переказує на банку, адмін підтверджує вручну (1 тап).

const JAR_URL = process.env.MONOBANK_JAR_URL;
const RATE = Number(process.env.USD_UAH_RATE) || 42;

export function jarEnabled(): boolean {
  return Boolean(JAR_URL);
}

export function getJarUrl(): string | null {
  return JAR_URL ?? null;
}

export function usdToUah(usd: number): number {
  return Math.round(usd * RATE);
}

export const USD_UAH_RATE = RATE;
