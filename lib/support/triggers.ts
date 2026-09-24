import "server-only";

// Список явних тригерів звернення до людини
const EXPLICIT_OPERATOR_TRIGGERS = [
  "оператор",
  "человек",
  "людина",
  "менеджер",
  "позови человека",
  "поклич людину",
  "покличте оператора",
  "живой оператор",
  "живий оператор",
  "з'єднай з оператором",
  "соедини с оператором",
  "human",
  "support agent",
  "speak to someone",
  "real person",
  "хочу человека",
  "поговорить с человеком",
];

// Тригери конфлікту, скарг та претензій
const CONFLICT_TRIGGERS = [
  "шахраї",
  "мошенники",
  "обман",
  "кидалово",
  "верните деньги",
  "поверніть гроші",
  "refund",
  "чарджбек",
  "chargeback",
  "где мой заказ",
  "де моє замовлення",
  "жахливий сервіс",
  "ужасный сервис",
  "скарга",
  "жалоба",
  "подам в суд",
  "ви знущаєтесь",
  "вы издеваетесь",
  "тупой бот",
  "тупий бот",
];

export type TriggerAnalysisResult = {
  shouldEscalate: boolean;
  reason?: string;
  type?: "explicit" | "conflict" | "repetition";
};

export function analyzeMessageTriggers(
  text: string,
  recentUserMessages: string[] = [],
): TriggerAnalysisResult {
  const lower = text.toLowerCase().trim();

  // 1. Явний запит людини
  for (const trigger of EXPLICIT_OPERATOR_TRIGGERS) {
    if (lower.includes(trigger)) {
      return {
        shouldEscalate: true,
        reason: `Клієнт запросив живого оператора (тригер: "${trigger}")`,
        type: "explicit",
      };
    }
  }

  // 2. Конфліктна ситуація або скарга
  for (const trigger of CONFLICT_TRIGGERS) {
    if (lower.includes(trigger)) {
      return {
        shouldEscalate: true,
        reason: `Виявлено конфлікт / скаргу (тригер: "${trigger}")`,
        type: "conflict",
      };
    }
  }

  // 3. Зациклення / повторення одного й того ж повідомлення
  if (recentUserMessages.length >= 2) {
    const lastTwo = recentUserMessages.slice(-2);
    if (lastTwo.every((m) => m.toLowerCase().trim() === lower)) {
      return {
        shouldEscalate: true,
        reason: "Клієнт двічі повторив однакове запитання (можливий збій розуміння AI)",
        type: "repetition",
      };
    }
  }

  return { shouldEscalate: false };
}
