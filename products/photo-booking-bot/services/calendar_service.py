from typing import List
from database.models import get_bookings_by_date, get_blocked_slots

DEFAULT_TIME_SLOTS = [
    "10:00",
    "11:30",
    "13:00",
    "14:30",
    "16:00",
    "17:30",
    "19:00"
]

async def get_available_slots(date_str: str) -> List[str]:
    """
    Повертає список доступних часових слотів на вказану дату,
    фільтруючи вже заброньовані та заблоковані адміністратором години.
    """
    # 1. Перевірка повного блокування дня
    blocked = await get_blocked_slots(date_str)
    day_blocked = any(not b["time_str"] for b in blocked)
    if day_blocked:
        return []

    blocked_times = {b["time_str"] for b in blocked if b["time_str"]}

    # 2. Перевірка існуючих бронювань
    bookings = await get_bookings_by_date(date_str)
    booked_times = {b["booking_time"] for b in bookings}

    busy_times = blocked_times | booked_times

    # 3. Фільтруємо
    available = [slot for slot in DEFAULT_TIME_SLOTS if slot not in busy_times]
    return available
