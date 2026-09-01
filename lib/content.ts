import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import ukFile from "../messages/uk.json";
import enFile from "../messages/en.json";
import { getContentOverrides } from "./store";

// Тексти сайту = файл messages/<locale>.json + правки адміна поверх нього.
//
// Змішуємо в одному місці — в i18n/request.ts, — тому будь-який t("hero.title")
// стає редагованим без жодної правки в компонентах. Файл лишається дефолтом:
// прибрали правку — повернувся задеплоєний текст.

export type Locale = "uk" | "en";

const FILES: Record<Locale, Messages> = {
  uk: ukFile as Messages,
  en: enFile as Messages,
};

type Messages = { [key: string]: string | Messages };

// Ключі в messages вкладені до 3 рівнів і завжди рядкові (масивів немає) —
// тож плоский «hero.title» однозначно адресує будь-який текст.
function flatten(node: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

function setPath(root: Messages, path: string, value: string): void {
  const parts = path.split(".");
  let node = root;
  for (const part of parts.slice(0, -1)) {
    const next = node[part];
    if (typeof next !== "object") return; // ключа немає у файлі — ігноруємо
    node = next;
  }
  node[parts[parts.length - 1]] = value;
}

export function defaultsFlat(locale: Locale): Record<string, string> {
  return flatten(FILES[locale]);
}

export const SECTIONS = Object.keys(FILES.uk);

// Кеш — Next-івський, а не свій у пам'яті: роут-хендлер і рендер сторінок
// живуть у різних екземплярах модуля, тож звичайна Map тут не скидається
// (перевірено — правка доїжджала лише після протухання TTL).
const TAG = "site-content";

const cachedOverrides = unstable_cache(
  async (locale: Locale) => {
    try {
      return await getContentOverrides(locale);
    } catch (e) {
      // Сховище лягло — сайт має лишитись з текстами з файлу, а не впасти.
      console.error("[content] overrides unavailable:", e);
      return {};
    }
  },
  ["site-content"],
  { tags: [TAG], revalidate: 300 },
);

// expire: 0 — адмін має побачити свою ж правку одразу, а не застарілий текст
// (updateTag дав би те саме, але він лише для Server Actions, а зберігаємо ми
// роут-хендлером).
export function bustContentCache(): void {
  revalidateTag(TAG, { expire: 0 });
}

export async function getMessages(locale: Locale): Promise<Messages> {
  const messages = structuredClone(FILES[locale]);
  const overrides = await cachedOverrides(locale);
  for (const [path, value] of Object.entries(overrides)) {
    setPath(messages, path, value);
  }
  return messages;
}
