export type Accent = "blue" | "purple" | "pink" | "green";
export type CategoryId = "telegram-bots" | "web" | "mobile";

export type Category = {
  id: CategoryId;
  label: string;
  icon: string;
  accent: Accent;
  description: string;
};

export type Product = {
  slug: string;
  category: CategoryId;
  badge: string;
  accent: Accent;
  title: string;
  tagline: string;
  description: string;
  thumbColor: string;
  thumbText: string;
  price: number;
  currency: "USD";
  delivery: string;
  warranty: string;
  stack: string[];
  features: string[];
  whatsIncluded: string[];
  sold: number;
  rating: number;
  ratingCount: number;
};

export const CATEGORIES: Category[] = [
  {
    id: "telegram-bots",
    label: "Telegram боти",
    icon: "ph-telegram-logo",
    accent: "blue",
    description: "Магазини, AI, саппорт, автоматизація групп.",
  },
  {
    id: "web",
    label: "Web / SaaS",
    icon: "ph-browsers",
    accent: "purple",
    description: "Адмін-панелі, CRM, лендинги, конструктори.",
  },
  {
    id: "mobile",
    label: "Мобільні додатки",
    icon: "ph-device-mobile",
    accent: "green",
    description: "React Native шаблони для iOS і Android.",
  },
];

export const PRODUCTS: Product[] = [
  // === TELEGRAM BOTS ===
  {
    slug: "tg-shop-cryptopay",
    category: "telegram-bots",
    badge: "SHOP",
    accent: "blue",
    title: "Telegram Shop з CryptoPay",
    tagline: "Магазин цифрових товарів з крипто-оплатою",
    description:
      "Готовий магазин для продажу цифрових товарів (файли, ключі, підписки). Оплата через CryptoBot у USDT, BTC, ETH. Адмін-панель в боті, статистика, повернення.",
    thumbColor: "00F0FF",
    thumbText: "TG+Shop+v2",
    price: 45,
    currency: "USD",
    delivery: "1 день",
    warranty: "1 рік саппорту",
    stack: ["Python", "Aiogram3", "SQLite", "CryptoPay API"],
    features: [
      "Каталог товарів з категоріями",
      "Оплата CryptoBot (USDT, BTC, TON)",
      "Автоматична видача товару після оплати",
      "Адмін-панель прямо в боті",
      "Статистика продажів, експорт CSV",
      "Реферальна система",
    ],
    whatsIncluded: [
      "Повний вихідний код",
      "Інструкція по встановленню",
      "Допомога з деплоєм на VPS",
      "1 рік оновлень і саппорту",
    ],
    sold: 340,
    rating: 4.9,
    ratingCount: 128,
  },
  {
    slug: "tg-shop-stripe",
    category: "telegram-bots",
    badge: "SHOP",
    accent: "blue",
    title: "Telegram Shop з Stripe",
    tagline: "Магазин з оплатою карткою через Stripe",
    description:
      "Версія Telegram Shop із класичною оплатою банківською карткою через Stripe. Підходить для легальної торгівлі цифровими товарами.",
    thumbColor: "00F0FF",
    thumbText: "Stripe+Shop",
    price: 55,
    currency: "USD",
    delivery: "1 день",
    warranty: "1 рік саппорту",
    stack: ["Python", "Aiogram3", "Stripe API", "PostgreSQL"],
    features: [
      "Каталог + кошик",
      "Оплата Stripe (карти, Apple Pay)",
      "Інвойси та чеки на email",
      "Адмін-панель з аналітикою",
      "Підтримка купонів і знижок",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Готова інтеграція Stripe",
      "Допомога з деплоєм",
      "1 рік саппорту",
    ],
    sold: 178,
    rating: 4.8,
    ratingCount: 64,
  },
  {
    slug: "ai-support-bot",
    category: "telegram-bots",
    badge: "AI",
    accent: "green",
    title: "AI Support Bot з GPT-4",
    tagline: "Автовідповідач на базі OpenAI з пам'яттю",
    description:
      "Бот-консультант для бізнесу. Відповідає на питання клієнтів за вашою базою знань, ескалює складні випадки на оператора.",
    thumbColor: "00FF66",
    thumbText: "AI+Support",
    price: 59,
    currency: "USD",
    delivery: "1 день",
    warranty: "3 міс. саппорту",
    stack: ["Python", "OpenAI", "Aiogram3", "Postgres"],
    features: [
      "GPT-4 з контекстом діалогу",
      "Кастомна база знань (PDF, FAQ)",
      "Ескалація на оператора",
      "Статистика по запитах",
      "Багатомовність (UA / EN / RU)",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Шаблон системного промпта",
      "Допомога з заливкою бази знань",
      "3 міс. саппорту",
    ],
    sold: 98,
    rating: 4.7,
    ratingCount: 31,
  },
  {
    slug: "crypto-wallet-bot",
    category: "telegram-bots",
    badge: "CRYPTO",
    accent: "pink",
    title: "Crypto Wallet Bot",
    tagline: "Telegram-гаманець для USDT / TON",
    description:
      "Кастодіальний гаманець з функціями депозиту, виведення, переказів між юзерами. Підтримує мережі TRC-20, ERC-20, TON.",
    thumbColor: "FF007F",
    thumbText: "Crypto+Wallet",
    price: 120,
    currency: "USD",
    delivery: "2-3 дні",
    warranty: "6 міс. саппорту",
    stack: ["Python", "Aiogram3", "Web3", "Redis"],
    features: [
      "Депозит / виведення USDT (TRC-20, TON)",
      "Перекази між юзерами по @username",
      "Курси через CoinGecko API",
      "Адмін-панель з холодним гаманцем",
      "2FA для виведення",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Налаштування серверу",
      "Інструкція з безпеки",
      "6 міс. саппорту",
    ],
    sold: 56,
    rating: 5.0,
    ratingCount: 22,
  },
  {
    slug: "channel-subs-manager",
    category: "telegram-bots",
    badge: "SUBS",
    accent: "purple",
    title: "Менеджер платних підписок",
    tagline: "Закриті канали з підпискою через бота",
    description:
      "Бот керує доступом до закритих Telegram-каналів. Автоматично запрошує після оплати, видаляє при закінченні підписки.",
    thumbColor: "8A2BE2",
    thumbText: "Subs+Manager",
    price: 75,
    currency: "USD",
    delivery: "1-2 дні",
    warranty: "6 міс. саппорту",
    stack: ["Python", "Aiogram3", "CryptoPay / Stripe"],
    features: [
      "Підписки на 1 / 3 / 6 / 12 міс.",
      "Автоматичне поновлення",
      "Промокоди і знижки",
      "Аналітика — LTV, churn",
      "Кілька каналів з одного бота",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Допомога зі стартом",
      "6 міс. саппорту",
    ],
    sold: 112,
    rating: 4.9,
    ratingCount: 47,
  },
  {
    slug: "booking-bot",
    category: "telegram-bots",
    badge: "BOOKING",
    accent: "blue",
    title: "Booking Bot — запис на послуги",
    tagline: "Запис клієнтів у салон / барбершоп / медцентр",
    description:
      "Бот для запису на послуги з вибором майстра, дати, часу. Інтегрується з Google Calendar.",
    thumbColor: "00F0FF",
    thumbText: "Booking",
    price: 65,
    currency: "USD",
    delivery: "2 дні",
    warranty: "6 міс. саппорту",
    stack: ["Python", "Aiogram3", "Google Calendar API"],
    features: [
      "Календар з вільними слотами",
      "Нагадування клієнту і майстру",
      "Інтеграція з Google Calendar",
      "Адмін-панель для майстрів",
      "Статистика по майстрах",
    ],
    whatsIncluded: ["Сорс-код", "Налаштування", "6 міс. саппорту"],
    sold: 88,
    rating: 4.8,
    ratingCount: 35,
  },
  {
    slug: "quiz-tournament-bot",
    category: "telegram-bots",
    badge: "GAME",
    accent: "pink",
    title: "Quiz / Tournament Bot",
    tagline: "Квізи, опитування, турніри з призами",
    description:
      "Інтерактивний бот для проведення квізів і опитувань в каналі чи групі. Турнірна таблиця, нагороди.",
    thumbColor: "FF007F",
    thumbText: "Quiz+Game",
    price: 39,
    currency: "USD",
    delivery: "1 день",
    warranty: "3 міс. саппорту",
    stack: ["Python", "Aiogram3", "SQLite"],
    features: [
      "Конструктор питань",
      "Таймери на відповіді",
      "Турнірна таблиця",
      "Видача нагород (промокоди, ролі)",
      "Експорт результатів в CSV",
    ],
    whatsIncluded: ["Сорс-код", "Інструкція", "3 міс. саппорту"],
    sold: 142,
    rating: 4.6,
    ratingCount: 58,
  },
  {
    slug: "group-admin-bot",
    category: "telegram-bots",
    badge: "MOD",
    accent: "green",
    title: "Group Admin Bot",
    tagline: "Антиспам, капча, авто-модерація",
    description:
      "Захист групи від спаму, ботів і небажаного контенту. Капча при вході, фільтр посилань, антифлуд.",
    thumbColor: "00FF66",
    thumbText: "Group+Admin",
    price: 29,
    currency: "USD",
    delivery: "1 день",
    warranty: "3 міс. саппорту",
    stack: ["Python", "Aiogram3"],
    features: [
      "Капча при вході",
      "Фільтр посилань і реклами",
      "Антифлуд по словах",
      "Warn / Mute / Ban",
      "Логи дій модерів",
    ],
    whatsIncluded: ["Сорс-код", "3 міс. саппорту"],
    sold: 256,
    rating: 4.7,
    ratingCount: 102,
  },

  // === WEB / SAAS ===
  {
    slug: "cyberdash-admin",
    category: "web",
    badge: "ADMIN",
    accent: "pink",
    title: "CyberDash — Next.js Admin Template",
    tagline: "Темна адмін-панель на Next.js + Tailwind",
    description:
      "Готовий до продакшену шаблон адмін-панелі. 40+ компонентів, таблиці, графіки, форми, темна тема.",
    thumbColor: "FF007F",
    thumbText: "SaaS+Dash",
    price: 29,
    currency: "USD",
    delivery: "Миттєво",
    warranty: "Безкоштовні апдейти",
    stack: ["Next.js 15", "Tailwind v4", "TypeScript", "Recharts"],
    features: [
      "40+ компонентів",
      "Темна / світла тема",
      "Адаптивність",
      "Auth boilerplate (NextAuth)",
      "Графіки, таблиці, форми",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Документація",
      "Безкоштовні апдейти",
    ],
    sold: 112,
    rating: 5.0,
    ratingCount: 42,
  },
  {
    slug: "mini-crm-agency",
    category: "web",
    badge: "CRM",
    accent: "purple",
    title: "Mini-CRM для агенцій",
    tagline: "Канбан лідів + інтеграція з Telegram",
    description:
      "Легка CRM для діджитал-агенцій і фрілансерів. Канбан, ліди, контракти, нагадування. Інтеграція з Telegram для нотифікацій.",
    thumbColor: "8A2BE2",
    thumbText: "Mini-CRM",
    price: 89,
    currency: "USD",
    delivery: "1 день",
    warranty: "1 рік саппорту",
    stack: ["Next.js 15", "Supabase", "TypeScript"],
    features: [
      "Канбан з drag-and-drop",
      "Картка ліда — нотатки, файли",
      "Telegram нотифікації",
      "Нагадування по email",
      "Багатокористувацький режим",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Готова Supabase міграція",
      "Допомога з деплоєм на Vercel",
      "1 рік саппорту",
    ],
    sold: 210,
    rating: 4.8,
    ratingCount: 88,
  },
  {
    slug: "landing-builder",
    category: "web",
    badge: "BUILDER",
    accent: "blue",
    title: "No-Code Landing Builder",
    tagline: "Конструктор лендингів з drag-and-drop",
    description:
      "Стартер для запуску свого Tilda-конкурента. Drag-and-drop редактор, шаблони, експорт.",
    thumbColor: "00F0FF",
    thumbText: "Landing+Builder",
    price: 149,
    currency: "USD",
    delivery: "3 дні",
    warranty: "1 рік саппорту",
    stack: ["Next.js", "DnD Kit", "Supabase"],
    features: [
      "Drag-and-drop редактор",
      "10 готових шаблонів",
      "Експорт HTML",
      "Хостинг через свій домен",
      "Аналітика переглядів",
    ],
    whatsIncluded: [
      "Сорс-код",
      "Шаблони",
      "1 рік саппорту",
    ],
    sold: 47,
    rating: 4.9,
    ratingCount: 21,
  },
  {
    slug: "portfolio-pro",
    category: "web",
    badge: "PORTFOLIO",
    accent: "green",
    title: "Portfolio Pro Template",
    tagline: "Портфоліо для дизайнерів і фотографів",
    description:
      "Тонко налаштований шаблон портфоліо з кейс-сторінками, мікро-анімаціями і CMS на Sanity.",
    thumbColor: "00FF66",
    thumbText: "Portfolio+Pro",
    price: 35,
    currency: "USD",
    delivery: "Миттєво",
    warranty: "Безкоштовні апдейти",
    stack: ["Next.js", "Sanity CMS", "Framer Motion"],
    features: [
      "Кейс-сторінки з галереями",
      "Анімації на скролі",
      "CMS на Sanity",
      "SEO готовий",
      "Темна / світла тема",
    ],
    whatsIncluded: ["Сорс-код", "Sanity Studio", "Апдейти"],
    sold: 89,
    rating: 4.7,
    ratingCount: 33,
  },
  {
    slug: "bot-constructor",
    category: "web",
    badge: "SAAS",
    accent: "pink",
    title: "Bot Constructor SaaS",
    tagline: "No-code конструктор Telegram-ботів",
    description:
      "Веб-платформа для збірки ботів без коду. Мультитенант, тарифи, біллінг. Готова база для запуску свого SaaS.",
    thumbColor: "FF007F",
    thumbText: "Bot+Constructor",
    price: 299,
    currency: "USD",
    delivery: "3-5 днів",
    warranty: "1 рік саппорту",
    stack: ["Next.js", "Postgres", "ReactFlow", "Stripe"],
    features: [
      "Drag-and-drop конструктор діалогів",
      "Мультитенант (багато ботів)",
      "Тарифи через Stripe",
      "Адмін-панель",
      "Аналітика по ботах",
    ],
    whatsIncluded: ["Сорс-код", "Деплой", "1 рік саппорту"],
    sold: 18,
    rating: 5.0,
    ratingCount: 9,
  },

  // === MOBILE ===
  {
    slug: "rn-food-delivery",
    category: "mobile",
    badge: "RN",
    accent: "blue",
    title: "Food Delivery App",
    tagline: "React Native додаток для доставки",
    description:
      "Готовий мобільний додаток для запуску сервісу доставки їжі. Каталог ресторанів, кошик, оплата, трекінг кур'єра.",
    thumbColor: "00F0FF",
    thumbText: "Food+Delivery",
    price: 199,
    currency: "USD",
    delivery: "1 день",
    warranty: "6 міс. саппорту",
    stack: ["React Native", "Expo", "Firebase"],
    features: [
      "Каталог ресторанів з фільтрами",
      "Кошик і оплата",
      "Карта з трекінгом кур'єра",
      "Push-нотифікації",
      "Адмін-панель ресторану (Web)",
    ],
    whatsIncluded: [
      "Сорс-код iOS + Android",
      "Допомога з публікацією",
      "6 міс. саппорту",
    ],
    sold: 34,
    rating: 4.8,
    ratingCount: 14,
  },
  {
    slug: "rn-fitness-tracker",
    category: "mobile",
    badge: "RN",
    accent: "green",
    title: "Fitness Tracker App",
    tagline: "Тренування, прогрес, статистика",
    description:
      "Додаток-щоденник тренувань з готовими програмами, статистикою, інтеграцією з Health Kit.",
    thumbColor: "00FF66",
    thumbText: "Fitness",
    price: 149,
    currency: "USD",
    delivery: "1 день",
    warranty: "6 міс. саппорту",
    stack: ["React Native", "Expo", "Supabase"],
    features: [
      "Бібліотека вправ",
      "Конструктор тренувань",
      "Статистика прогресу",
      "Health Kit / Google Fit",
      "Соц-функції — друзі, лідерборд",
    ],
    whatsIncluded: ["Сорс-код", "Іконки", "6 міс. саппорту"],
    sold: 28,
    rating: 4.9,
    ratingCount: 11,
  },
  {
    slug: "rn-crypto-wallet",
    category: "mobile",
    badge: "RN",
    accent: "purple",
    title: "Crypto Wallet App",
    tagline: "Web3 гаманець для iOS / Android",
    description:
      "Не-кастодіальний крипто-гаманець з підтримкою кількох мереж і dApp browser.",
    thumbColor: "8A2BE2",
    thumbText: "Crypto+Wallet",
    price: 249,
    currency: "USD",
    delivery: "2-3 дні",
    warranty: "1 рік саппорту",
    stack: ["React Native", "Web3.js", "WalletConnect"],
    features: [
      "Підтримка ETH / BSC / Polygon",
      "Send / Receive / Swap",
      "dApp browser (WalletConnect)",
      "Біометрія для розблокування",
      "Бекап через seed phrase",
    ],
    whatsIncluded: [
      "Сорс-код iOS + Android",
      "Допомога з безпекою",
      "1 рік саппорту",
    ],
    sold: 19,
    rating: 5.0,
    ratingCount: 7,
  },
  {
    slug: "rn-chat-messenger",
    category: "mobile",
    badge: "RN",
    accent: "pink",
    title: "Chat / Messenger App",
    tagline: "Месенджер у стилі Telegram з кінцевим шифруванням",
    description:
      "Стартер для свого месенджера — чати, групи, голосові, шифрування. Бек на Node + Postgres.",
    thumbColor: "FF007F",
    thumbText: "Chat+App",
    price: 299,
    currency: "USD",
    delivery: "3 дні",
    warranty: "1 рік саппорту",
    stack: ["React Native", "Node.js", "WebSocket", "Postgres"],
    features: [
      "1-на-1 та групові чати",
      "Голосові повідомлення",
      "Кінцеве шифрування",
      "Push-нотифікації",
      "Web-версія",
    ],
    whatsIncluded: ["Сорс RN + бек", "Деплой бека", "1 рік саппорту"],
    sold: 12,
    rating: 4.8,
    ratingCount: 5,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export const ACCENT_TEXT: Record<Accent, string> = {
  blue: "text-neon-blue",
  purple: "text-neon-purple",
  pink: "text-neon-pink",
  green: "text-neon-green",
};

export const ACCENT_BORDER: Record<Accent, string> = {
  blue: "border-neon-blue/30",
  purple: "border-neon-purple/30",
  pink: "border-neon-pink/30",
  green: "border-neon-green/30",
};

export const ACCENT_BG: Record<Accent, string> = {
  blue: "bg-neon-blue/10",
  purple: "bg-neon-purple/10",
  pink: "bg-neon-pink/10",
  green: "bg-neon-green/10",
};

export const ACCENT_BUTTON: Record<Accent, string> = {
  blue: "bg-neon-blue text-black shadow-[0_10px_30px_-10px_rgba(0,240,255,0.5)]",
  purple: "bg-neon-purple text-white shadow-[0_10px_30px_-10px_rgba(138,43,226,0.5)]",
  pink: "bg-neon-pink text-black shadow-[0_10px_30px_-10px_rgba(255,0,127,0.5)]",
  green: "bg-neon-green text-black shadow-[0_10px_30px_-10px_rgba(0,255,102,0.5)]",
};
