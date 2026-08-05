"""
DevqSpace Admin Bot.

Простий бот для адміна студії. Реагує на команди в особистому чаті
адміна. Замовлення з сайту приходять напряму через Bot API від
`/api/order` route handler (Next.js), цей скрипт додає інтерактивні
команди /start, /help, /stats, /ping.

Запуск:
    1. cp .env.example .env  → заповнити BOT_TOKEN та ADMIN_CHAT_ID
    2. pip install -r requirements.txt
    3. python admin_bot.py

Працює в режимі long polling — встановіть на VPS і тримайте через
systemd / pm2 / supervisor.
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections import Counter
from datetime import datetime
from pathlib import Path

from aiogram import Bot, Dispatcher, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import Message
from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID")

if not BOT_TOKEN:
    raise SystemExit("BOT_TOKEN не задано в .env")
if not ADMIN_CHAT_ID:
    raise SystemExit("ADMIN_CHAT_ID не задано в .env")

ADMIN_CHAT_ID_INT = int(ADMIN_CHAT_ID)

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(message)s")
log = logging.getLogger("nexus-admin")

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)
dp = Dispatcher()

# In-memory лічильники за сесію (живуть до рестарту).
# Реальні замовлення пишуть напряму через Bot API з сайту — їх не видно
# тут, бо це outbound. Цей лічильник рахує лише messages, що тригерять бот.
stats = Counter()
started_at = datetime.now()


def is_admin(message: Message) -> bool:
    return message.chat.id == ADMIN_CHAT_ID_INT


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    if not is_admin(message):
        return
    await message.answer(
        "👋 <b>DevqSpace Admin Bot активний</b>\n\n"
        "Замовлення з сайту приходитимуть сюди автоматично.\n\n"
        "Доступні команди:\n"
        "/help — список команд\n"
        "/stats — статистика сесії\n"
        "/ping — перевірити що бот живий"
    )


@dp.message(Command("help"))
async def cmd_help(message: Message) -> None:
    if not is_admin(message):
        return
    await message.answer(
        "🛠 <b>Команди</b>\n\n"
        "/start — привітання\n"
        "/stats — статистика з моменту запуску\n"
        "/ping — перевірити доступність\n"
        "/where — отримати свій chat_id (для налаштування .env сайту)"
    )


@dp.message(Command("ping"))
async def cmd_ping(message: Message) -> None:
    if not is_admin(message):
        return
    await message.answer("🟢 pong")


@dp.message(Command("where"))
async def cmd_where(message: Message) -> None:
    await message.answer(
        f"chat_id: <code>{message.chat.id}</code>\n"
        f"username: @{message.from_user.username if message.from_user else '—'}"
    )


@dp.message(Command("stats"))
async def cmd_stats(message: Message) -> None:
    if not is_admin(message):
        return
    uptime = datetime.now() - started_at
    h, rem = divmod(int(uptime.total_seconds()), 3600)
    m, s = divmod(rem, 60)

    lines = [
        "📊 <b>Статистика сесії</b>",
        "",
        f"⏱ Аптайм: {h}г {m}хв {s}с",
        f"📨 Повідомлень: {sum(stats.values())}",
    ]
    if stats:
        lines.append("")
        lines.append("За типами:")
        for k, v in stats.most_common():
            lines.append(f"  · {k}: {v}")
    lines.append("")
    lines.append(
        "<i>Замовлення з сайту бачите вище в історії чату — кожне "
        "приходить окремим повідомленням.</i>"
    )
    await message.answer("\n".join(lines))


@dp.message(F.text)
async def fallback(message: Message) -> None:
    if not is_admin(message):
        return
    stats["text"] += 1


async def main() -> None:
    log.info("DevqSpace admin bot starting…")
    try:
        await bot.send_message(
            ADMIN_CHAT_ID_INT,
            "🟢 <b>Admin bot online</b>\n<i>Готовий приймати замовлення.</i>",
        )
    except Exception as e:  # noqa: BLE001
        log.warning("Не вдалося відправити стартове повідомлення: %s", e)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        log.info("Stopped.")
