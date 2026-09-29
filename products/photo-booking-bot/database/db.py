import aiosqlite
import logging
from config import DB_PATH

logger = logging.getLogger(__name__)

async def get_db() -> aiosqlite.Connection:
    conn = await aiosqlite.connect(DB_PATH)
    conn.row_factory = aiosqlite.Row
    return conn

async def init_db():
    """Створює всі необхідні таблиці та початкові дані."""
    async with await get_db() as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                price INTEGER NOT NULL,
                currency TEXT DEFAULT 'грн',
                deposit INTEGER DEFAULT 500,
                duration_min INTEGER DEFAULT 60,
                is_active INTEGER DEFAULT 1,
                order_idx INTEGER DEFAULT 0
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                file_id TEXT NOT NULL,
                caption TEXT DEFAULT '',
                order_idx INTEGER DEFAULT 0
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                user_name TEXT,
                user_contact TEXT,
                service_id INTEGER,
                service_title TEXT,
                booking_date TEXT NOT NULL,
                booking_time TEXT NOT NULL,
                location TEXT DEFAULT '',
                status TEXT DEFAULT 'PENDING',
                deposit_paid INTEGER DEFAULT 0,
                notes TEXT DEFAULT '',
                receipt_file_id TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS clients (
                user_id INTEGER PRIMARY KEY,
                first_name TEXT,
                username TEXT,
                phone TEXT,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS blocked_slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date_str TEXT NOT NULL,
                time_str TEXT DEFAULT '',
                reason TEXT DEFAULT ''
            );
        """)

        await db.commit()

        # Заповнення дефолтними налаштуваннями, якщо таблиця пуста
        await seed_defaults(db)

async def seed_defaults(db: aiosqlite.Connection):
    cursor = await db.execute("SELECT COUNT(*) as count FROM settings;")
    row = await cursor.fetchone()
    if row and row["count"] > 0:
        return

    default_settings = {
        "photographer_name": "Олена Мороз",
        "studio_name": "Studio Moonlight",
        "welcome_text": (
            "📸 <b>Вітаю! Я бот-асистент фотографа Олени Мороз</b> ✨\n\n"
            "Тут ви можете переглянути моє портфоліо, дізнатися вартість пакетів та забронювати зйомку онлайн за 1 хвилину.\n\n"
            "Оберіть потрібний розділ нижче 👇"
        ),
        "contact_telegram": "@olena_photo",
        "contact_instagram": "@olena.ph",
        "contact_phone": "+380 99 123 45 67",
        "contact_website": "https://olenamoroz.photo",
        "locations_text": (
            "📍 <b>Популярні локації для зйомок</b>:\n\n"
            "1. Фотостудія «Lightroom» (вул. Центральна, 14)\n"
            "2. Оранжерея та ботанічний сад\n"
            "3. Старе місто та затишні європейські кав'ярні\n"
            "4. Природа біля озера (для західного сонця / Golden Hour)"
        ),
        "prep_guide_text": (
            "📄 <b>Гайд підготовки до фотосесії</b>:\n\n"
            "👗 <b>Одяг та образ</b>:\n"
            "• Обирайте однотонний одяг без великих принтів та логотипів\n"
            "• Ідеально пасують пастельні, бежеві, білі, глибокі темні тони\n"
            "• Для пар чи сімей — підберіть гармонійний Family Look (2-3 спільні кольори)\n\n"
            "💄 <b>Макіяж та волосся</b>:\n"
            "• Рекомендується денний або професійний макіяж (камера «з'їдає» 30% насиченості)\n"
            "• Візьміть з собою пудру та гребінець\n\n"
            "⏰ <b>Таймінг</b>:\n"
            "• Будь ласка, приходьте за 10–15 хвилин до початку для спокійної підготовки."
        ),
        "card_number": "4441 1111 2222 3333 (Monobank / Олена М.)",
        "monobank_jar_url": "https://send.monobank.ua/jar/example",
        "deposit_enabled": "true",
        "default_deposit_amount": "500",
        "payment_instructions": (
            "Для підтвердження слота в календарі внесіть завдаток <b>{amount} грн</b>.\n"
            "Решта суми сплачується у день зйомки."
        ),
        "reminder_24h_enabled": "true",
        "reminder_24h_text": (
            "⏰ <b>Нагадування про фотосесію</b>!\n\n"
            "Завтра ({date}) о {time} запланована зйомка: <b>{service}</b>.\n"
            "Локація: {location}\n"
            "Не забудьте переглянути гайд підготовки!"
        ),
        "reminder_2h_enabled": "true",
        "reminder_2h_text": (
            "⏰ <b>До зустрічі залишилось 2 години</b>!\n\n"
            "Сьогодні о {time} ваша зйомка: <b>{service}</b>.\n"
            "Гарного настрою, скоро зустрінемось! 📸"
        ),
        "admin_pin": "7788",
    }

    for k, v in default_settings.items():
        await db.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);", (k, v))

    # Додаємо стандартні послуги фотографа
    default_services = [
        (
            "👩 Індивідуальна / Портрет",
            "15-40 фото в авторській ретуші, допомога з позуванням та мудбордом, віддача готових фото за 5 днів.",
            1800,
            "грн",
            500,
            60,
            1,
            1
        ),
        (
            "❤️ Love Story / Пара",
            "Живі, щирі емоції без постановочного напруження, підбір затишних локацій або студії, колір-корекція всіх вдалих кадрів.",
            2400,
            "грн",
            500,
            90,
            1,
            2
        ),
        (
            "🏢 Студійна зйомка",
            "Робота з імпульсним та постійним світлом, бронь перевірених фотостудій, можливість підключення візажиста.",
            3200,
            "грн",
            600,
            90,
            1,
            3
        ),
        (
            "💍 Весільна фотосесія",
            "Зйомка ранку наречених, прогулянки, церемонії розпису та банкету. Дерев'яний бокс з флешкою та надрукованими фото.",
            7500,
            "грн",
            1500,
            240,
            1,
            4
        ),
        (
            "📱 Контент для брендів / Reels",
            "Створення візуалу для Instagram, предметна зйомка, зйомка коротких атмосферних відео Reels/TikTok.",
            2800,
            "грн",
            500,
            120,
            1,
            5
        ),
    ]

    for s in default_services:
        await db.execute("""
            INSERT INTO services (title, description, price, currency, deposit, duration_min, is_active, order_idx)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, s)

    await db.commit()
    logger.info("Database initialized with seed data successfully.")
