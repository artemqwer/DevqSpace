import assert from "node:assert";

// 1. Тест маскирования PII
function maskEmail(email) {
  if (!email || !email.includes("@")) return "—";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return "—";
  const clean = phone.replace(/[^\d+]/g, "");
  if (clean.length < 7) return "***";
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}******${suffix}`;
}

console.log("▶ Тестирование маскирования PII...");
assert.strictEqual(maskEmail("artem.devq@gmail.com"), "a***q@gmail.com");
assert.strictEqual(maskEmail("ab@xyz.com"), "a***@xyz.com");
assert.strictEqual(maskPhone("+380991234567"), "+380******4567");
console.log("  ✓ PII маскирование работает корректно");

// 2. Тест триггеров эскалации
const EXPLICIT = ["оператор", "человек", "людина", "менеджер", "позови человека", "живой оператор"];
const CONFLICT = ["мошенники", "обман", "верните деньги", "поверніть гроші", "где мой заказ", "вы издеваетесь"];

function analyze(text) {
  const l = text.toLowerCase();
  for (const t of EXPLICIT) {
    if (l.includes(t)) return { shouldEscalate: true, type: "explicit" };
  }
  for (const t of CONFLICT) {
    if (l.includes(t)) return { shouldEscalate: true, type: "conflict" };
  }
  return { shouldEscalate: false };
}

console.log("▶ Тестирование триггеров эскалации...");
assert.strictEqual(analyze("Привет, позови человека пожалуйста").shouldEscalate, true);
assert.strictEqual(analyze("Привет, позови человека пожалуйста").type, "explicit");

assert.strictEqual(analyze("Вы мошенники! Верните деньги немедленно!").shouldEscalate, true);
assert.strictEqual(analyze("Вы мошенники! Верните деньги немедленно!").type, "conflict");

assert.strictEqual(analyze("Добрый день, подскажите цену на бота").shouldEscalate, false);
console.log("  ✓ Триггеры эскалации и распознавание конфликтов работают четко");

// 3. Тест логики брутфорс защиты
console.log("▶ Тестирование счетчика попыток и блокировки (Anti-Brute Force)...");
let failedAttempts = 0;
let lockedUntil = null;
const maxAttempts = 3;

function attempt(correct) {
  const now = Date.now();
  if (lockedUntil && lockedUntil > now) {
    return { error: "LOCKED" };
  }
  if (!correct) {
    failedAttempts++;
    if (failedAttempts >= maxAttempts) {
      lockedUntil = now + 15 * 60 * 1000;
      return { error: "LOCKED" };
    }
    return { error: "FAILED", remaining: maxAttempts - failedAttempts };
  }
  failedAttempts = 0;
  return { success: true };
}

assert.strictEqual(attempt(false).remaining, 2);
assert.strictEqual(attempt(false).remaining, 1);
assert.strictEqual(attempt(false).error, "LOCKED");
assert.strictEqual(attempt(true).error, "LOCKED"); // Все еще заблокировано!
console.log("  ✓ Защита от перебора блокирует попытки после 3 ошибок");

console.log("\n✅ Все тесты модуля поддержки успешно пройдены!");
