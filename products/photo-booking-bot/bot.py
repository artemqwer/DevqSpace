import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiohttp import web
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import BOT_TOKEN, ADMIN_ID, WEB_PORT
from database.db import init_db
from database.models import add_admin, set_setting
from handlers.client import client_router
from handlers.admin import admin_router
from services.reminder_service import check_and_send_reminders
from web.app import create_web_app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("photobooking_bot")

async def main():
    logger.info("Initializing PhotoBooking Bot...")

    if not BOT_TOKEN:
        logger.error(
            "ПОМИЛКА: Не вказано BOT_TOKEN у файлі .env!\n"
            "Будь ласка, створіть файл .env за зразком .env.example та додайте BOT_TOKEN."
        )
        return

    # 1. Ініціалізація бази даних та налаштувань
    await init_db()

    # Якщо в .env передано ADMIN_ID, реєструємо його в базі
    if ADMIN_ID > 0:
        await add_admin(ADMIN_ID, "SuperAdmin")
        await set_setting("super_admin_id", str(ADMIN_ID))

    # 2. Створення бота та диспетчера
    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    dp = Dispatcher()

    # Реєстрація роутерів: спочатку адмін, потім клієнт
    dp.include_router(admin_router)
    dp.include_router(client_router)

    # 3. Планувальник авто-нагадувань (перевірка кожні 15 хвилин)
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        check_and_send_reminders,
        "interval",
        minutes=15,
        kwargs={"bot": bot}
    )
    scheduler.start()
    logger.info("Reminder scheduler started.")

    # 4. Запуск веб-панелі керування
    web_app = create_web_app()
    runner = web.AppRunner(web_app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", WEB_PORT)
    try:
        await site.start()
        logger.info(f"Web Dashboard started on http://0.0.0.0:{WEB_PORT}")
    except Exception as e:
        logger.warning(f"Could not bind Web Dashboard on port {WEB_PORT}: {e}")

    # 5. Запуск polling бота
    logger.info("Bot polling started. Press Ctrl+C to stop.")
    try:
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        scheduler.shutdown()
        await runner.cleanup()
        await bot.session.close()
        logger.info("Bot stopped.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot terminated by user.")
