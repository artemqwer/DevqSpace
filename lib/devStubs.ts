// Прапорці dev-заглушок. Тут НЕ повинно бути імпортів node:* — файл може
// потрапити в клієнтський бандл. Робота з диском — у lib/devStorage.ts.

export const IS_PROD = process.env.NODE_ENV === "production";

// Заглушки живуть лише поза продакшеном. DEVQ_DEV_STUBS=off вимикає їх
// локально — тоді поведінка збігається з продом без ключів (усе відключено).
export const DEV_STUBS = !IS_PROD && process.env.DEVQ_DEV_STUBS !== "off";

// Базовий URL для абсолютних посилань, які генеруються поза контекстом запиту
// (посилання на файл у листі, URL dev-blob). У проді не використовується.
export function devBaseUrl(): string {
  return process.env.DEVQ_PUBLIC_URL || "http://localhost:3000";
}

// Захист dev-роутів. Next не вирізає роути по env під час збірки, тому кожен
// хендлер під /dev та /api/dev зобов'язаний викликати це першим рядком:
// серед них є той, що позначає замовлення оплаченим.
export function devRouteBlocked(): boolean {
  return IS_PROD;
}

// Режим локальної видачі замовлень у теку на диску (замість email / telegram).
// Активний або при явному прапорці LOCAL_DELIVERY=true/1 (тільки поза продом),
// або автоматично у dev-середовищі (коли активні dev-заглушки чи IS_DEV), якщо
// явно не вимкнено через LOCAL_DELIVERY=off/false.
export function isLocalDeliveryActive(): boolean {
  if (IS_PROD) return false;
  const flag = process.env.LOCAL_DELIVERY?.trim().toLowerCase();
  if (flag === "false" || flag === "off" || flag === "0") return false;
  if (flag === "true" || flag === "1" || flag === "on") return true;
  return DEV_STUBS;
}
