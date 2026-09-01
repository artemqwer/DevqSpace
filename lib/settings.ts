import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { getSiteSettings } from "./store";
import { tgGetBotUsername } from "./telegram";

// Налаштування сайту, які адмін міняє без деплою: контакт підтримки,
// реквізити юрособи, тумблер публікації юридичних сторінок.
//
// Кеш — Next-івський з тегом, як у lib/content.ts: роут-хендлер і рендер
// сторінок живуть у різних екземплярах модуля, тож звичайна Map у пам'яті
// тут не скидається.

export type SiteSettings = {
  supportTelegram: string; // без @; порожньо -> фолбек на юзернейм бота
  legalEnabled: boolean;
  entityType: string; // ФОП / ТОВ
  entityName: string;
  edrpou: string;
  address: string;
  supportEmail: string;
  supportPhone: string;
  workHours: string;
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  supportTelegram: "",
  legalEnabled: false,
  entityType: "ФОП",
  entityName: "",
  edrpou: "",
  address: "",
  supportEmail: "",
  supportPhone: "",
  workHours: "Пн–Пт, 10:00–19:00 (Київ)",
};

const TAG = "site-settings";

const cachedRaw = unstable_cache(
  async () => {
    try {
      return await getSiteSettings();
    } catch (e) {
      // Сховище лягло — сайт має працювати з дефолтами, а не впасти.
      console.error("[settings] unavailable:", e);
      return {} as Record<string, string>;
    }
  },
  ["site-settings"],
  { tags: [TAG], revalidate: 300 },
);

// expire: 0 — адмін має побачити свою ж зміну одразу.
export function bustSettingsCache(): void {
  revalidateTag(TAG, { expire: 0 });
}

export async function getSettings(): Promise<SiteSettings> {
  const raw = await cachedRaw();
  return {
    ...SETTINGS_DEFAULTS,
    ...Object.fromEntries(
      Object.entries(raw).filter(([, v]) => typeof v === "string" && v !== ""),
    ),
    // Тумблер зберігається рядком, як і решта — зводимо до boolean тут.
    legalEnabled: raw.legalEnabled === "1",
  };
}

// Куди ведуть кнопки «Написати в Telegram». Порожнє налаштування —
// фолбек на юзернейм бота; немає й його — посилання не показуємо взагалі,
// краще ніякої кнопки, ніж кнопка в нікуди.
export async function getSupportTgUrl(): Promise<string | null> {
  const { supportTelegram } = await getSettings();
  const handle = supportTelegram.replace(/^@/, "") || (await tgGetBotUsername());
  return handle ? `https://t.me/${handle}` : null;
}
