import logging
from datetime import datetime, timedelta
from aiogram import Bot
from database.models import get_upcoming_confirmed_bookings, get_setting

logger = logging.getLogger(__name__)

# Множина вже відправлених нагадувань: "booking_id:24h", "booking_id:2h"
_sent_reminders = set()

async def check_and_send_reminders(bot: Bot):
    """
    Періодично перевіряє майбутні записи та відправляє нагадування
    за 24 години та за 2 години до зйомки.
    """
    try:
        rem_24_on = (await get_setting("reminder_24h_enabled", "true")) == "true"
        rem_2_on = (await get_setting("reminder_2h_enabled", "true")) == "true"

        if not rem_24_on and not rem_2_on:
            return

        text_24 = await get_setting("reminder_24h_text")
        text_2 = await get_setting("reminder_2h_text")

        now = datetime.now()
        upcoming = await get_upcoming_confirmed_bookings()

        for b in upcoming:
            b_id = b["id"]
            user_id = b["user_id"]
            date_str = b["booking_date"]
            time_str = b["booking_time"]
            service_title = b["service_title"] or "Фотосесія"
            location = b["location"] or "за домовленістю"

            try:
                b_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
            except Exception:
                continue

            diff = b_dt - now

            # 1. Нагадування за 24 години (між 23 та 25 годинами до зйомки)
            key_24 = f"{b_id}:24h"
            if rem_24_on and key_24 not in _sent_reminders:
                if timedelta(hours=22) <= diff <= timedelta(hours=26):
                    msg = text_24.format(
                        date=date_str,
                        time=time_str,
                        service=service_title,
                        location=location
                    )
                    try:
                        await bot.send_message(user_id, msg, parse_mode="HTML")
                        _sent_reminders.add(key_24)
                        logger.info(f"Sent 24h reminder for booking #{b_id} to user {user_id}")
                    except Exception as e:
                        logger.warning(f"Failed to send 24h reminder to {user_id}: {e}")

            # 2. Нагадування за 2 години (між 1.5 та 2.5 годинами до зйомки)
            key_2 = f"{b_id}:2h"
            if rem_2_on and key_2 not in _sent_reminders:
                if timedelta(minutes=90) <= diff <= timedelta(minutes=150):
                    msg = text_2.format(
                        date=date_str,
                        time=time_str,
                        service=service_title,
                        location=location
                    )
                    try:
                        await bot.send_message(user_id, msg, parse_mode="HTML")
                        _sent_reminders.add(key_2)
                        logger.info(f"Sent 2h reminder for booking #{b_id} to user {user_id}")
                    except Exception as e:
                        logger.warning(f"Failed to send 2h reminder to {user_id}: {e}")

    except Exception as e:
        logger.error(f"Error in check_and_send_reminders: {e}")
