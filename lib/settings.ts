import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { getSiteSettings } from "./store";
// Налаштування сайту, які адмін міняє без деплою: контакт підтримки,
// реквізити юрособи, тумблер публікації юридичних сторінок.
//
// Кеш — Next-івський з тегом, як у lib/content.ts: роут-хендлер і рендер
// сторінок живуть у різних екземплярах модуля, тож звичайна Map у пам'яті
// тут не скидається.

export type SiteSettings = {
  supportTelegram: string; // без @; за замовчуванням "devqspace"
  legalEnabled: boolean;
  entityType: string; // ФОП / ТОВ
  entityName: string;
  edrpou: string;
  address: string;
  supportEmail: string;
  supportPhone: string;
  workHours: string;
  // Оголошення в хедері (статичне або рухомий рядок / маркі)
  announcementEnabled: boolean;
  announcementText: string;
  announcementMode: "static" | "marquee"; // статичне або біжучий рядок
  announcementBg: "neon-blue" | "gradient" | "neon-purple" | "neon-pink" | "surface";
  announcementLink?: string;
  announcementLinkText?: string;
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  supportTelegram: "devqspace",
  legalEnabled: false,
  entityType: "ФОП",
  entityName: "",
  edrpou: "",
  address: "",
  supportEmail: "",
  supportPhone: "",
  workHours: "Пн–Пт, 10:00–19:00 (Київ)",
  announcementEnabled: false,
  announcementText: "🔥 Знижка 20% на всі Telegram-боти за промокодом PHOTO20!",
  announcementMode: "marquee",
  announcementBg: "gradient",
  announcementLink: "/catalog",
  announcementLinkText: "До каталогу →",
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
    // Тумблери зберігаються рядком "1" — зводимо до boolean тут.
    legalEnabled: raw.legalEnabled === "1",
    announcementEnabled: raw.announcementEnabled === "1",
    announcementMode:
      raw.announcementMode === "static" ? "static" : "marquee",
    announcementBg:
      (raw.announcementBg as SiteSettings["announcementBg"]) ||
      SETTINGS_DEFAULTS.announcementBg,
  };
}

// Куди ведуть кнопки «Написати в Telegram». За замовчуванням веде
// на особистий акаунт @devqspace (або значення з налаштувань).
export async function getSupportTgUrl(): Promise<string> {
  const { supportTelegram } = await getSettings();
  const handle = supportTelegram?.replace(/^@/, "").trim() || "devqspace";
  return `https://t.me/${handle}`;
}
