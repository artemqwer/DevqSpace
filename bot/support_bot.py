"""
DevqSpace Support Bot.

Окремий Telegram-бот для служби підтримки DevqSpace.
Дозволяє операторам листуватися з клієнтами прямо з Telegram (від ролі сапорту)
через звичайний Reply на повідомлення клієнта або команду /reply.

Запуск:
    1. Створіть другого бота в @BotFather (напр. @DevqSpaceSupportBot)
    2. Додайте SUPPORT_BOT_TOKEN та SUPPORT_ADMIN_CHAT_ID у bot/.env або кореневий .env
    3. pip install -r requirements.txt
    4. python support_bot.py

Працює в режимі long-polling для локального тестування або хостингу на VPS,
пересилаючи оновлення на API DevqSpace.
"""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

import aiohttp
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import Update
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))
load_dotenv(Path(__file__).parent.parent / ".env")

BOT_TOKEN = (
    os.getenv("SUPPORT_TELEGRAM_BOT_TOKEN")
    or os.getenv("SUPPORT_BOT_TOKEN")
    or ""
)
ADMIN_CHAT_ID = os.getenv("SUPPORT_TELEGRAM_ADMIN_CHAT_ID") or os.getenv("SUPPORT_ADMIN_CHAT_ID") or os.getenv("TELEGRAM_ADMIN_CHAT_ID")
API_BASE_URL = os.getenv("DEVQ_PUBLIC_URL", "http://localhost:3000").rstrip("/")
WEBHOOK_SECRET = os.getenv("SUPPORT_TELEGRAM_WEBHOOK_SECRET") or os.getenv("TELEGRAM_WEBHOOK_SECRET") or ""

if not BOT_TOKEN:
    raise SystemExit("SUPPORT_TELEGRAM_BOT_TOKEN не задано в .env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(levelname)s — %(message)s")
log = logging.getLogger("devq-support-bot")

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)
dp = Dispatcher()


@dp.update()
async def forward_update_to_api(update: Update):
    """
    Перенаправляє всі оновлення (повідомлення, reply операторів, callback_query)
    на Next.js ендпоінт /api/support/tg-webhook для єдиної обробки всієї логіки.
    """
    webhook_url = f"{API_BASE_URL}/api/support/tg-webhook"
    headers = {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
    }

    raw_payload = update.model_dump(mode="json", exclude_none=True)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook_url, json=raw_payload, headers=headers, timeout=15) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    log.warning(f"Webhook responded with {resp.status}: {text}")
    except Exception as e:
        log.error(f"Помилка зв'язку з {webhook_url}: {e}")


async def main():
    log.info("Запуск DevqSpace Support Bot (Long Polling)...")
    log.info(f"Цільовий API: {API_BASE_URL}/api/support/tg-webhook")
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        log.info("Support бот зупинено.")
