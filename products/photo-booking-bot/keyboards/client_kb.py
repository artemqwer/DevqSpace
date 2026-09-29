from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from typing import List, Dict, Any
from datetime import datetime, timedelta

def main_menu_kb() -> ReplyKeyboardMarkup:
    kb = [
        [KeyboardButton(text="📅 Записатися на зйомку")],
        [KeyboardButton(text="💰 Пакети та ціни"), KeyboardButton(text="🖼 Портфоліо")],
        [KeyboardButton(text="📍 Локації"), KeyboardButton(text="📄 Гайд підготовки")],
        [KeyboardButton(text="📞 Контакти")],
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

def cancel_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="❌ Скасувати")]],
        resize_keyboard=True
    )

def portfolio_categories_kb(categories: List[str]) -> InlineKeyboardMarkup:
    inline_kb = []
    row = []
    for cat in categories:
        row.append(InlineKeyboardButton(text=f"📷 {cat}", callback_data=f"port_cat:{cat}"))
        if len(row) == 2:
            inline_kb.append(row)
            row = []
    if row:
        inline_kb.append(row)
    inline_kb.append([InlineKeyboardButton(text="📅 Записатися на зйомку", callback_data="start_booking")])
    return InlineKeyboardMarkup(inline_keyboard=inline_kb)

def services_list_kb(services: List[Dict[str, Any]]) -> InlineKeyboardMarkup:
    buttons = []
    for s in services:
        title = s["title"]
        price = s["price"]
        curr = s.get("currency", "грн")
        buttons.append([
            InlineKeyboardButton(
                text=f"{title} — {price} {curr}",
                callback_data=f"book_service:{s['id']}"
            )
        ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def dates_kb(days_ahead: int = 14) -> InlineKeyboardMarkup:
    """Генерує кнопки з датами на найближчі 14 днів."""
    buttons = []
    row = []
    ua_weekdays = {0: "Пн", 1: "Вт", 2: "Ср", 3: "Чт", 4: "Пт", 5: "Сб", 6: "Нд"}
    now = datetime.now()

    for i in range(1, days_ahead + 1):
        target = now + timedelta(days=i)
        date_str = target.strftime("%Y-%m-%d")
        day_name = ua_weekdays[target.weekday()]
        day_month = target.strftime("%d.%m")
        label = f"{day_name} {day_month}"

        row.append(InlineKeyboardButton(text=label, callback_data=f"book_date:{date_str}"))
        if len(row) == 2:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)

    buttons.append([InlineKeyboardButton(text="⬅️ Назад", callback_data="back_to_services")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def time_slots_kb(available_slots: List[str], date_str: str) -> InlineKeyboardMarkup:
    buttons = []
    row = []
    for slot in available_slots:
        row.append(InlineKeyboardButton(text=f"⏰ {slot}", callback_data=f"book_time:{date_str}:{slot}"))
        if len(row) == 2:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)
    buttons.append([InlineKeyboardButton(text="📅 Обрати іншу дату", callback_data="reselect_date")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def payment_action_kb(booking_id: int, jar_url: str = "", deposit_amount: int = 500) -> InlineKeyboardMarkup:
    buttons = []
    if jar_url and jar_url.startswith("http"):
        buttons.append([
            InlineKeyboardButton(text=f"💳 Оплатити завдаток {deposit_amount} грн (Monobank)", url=jar_url)
        ])
    buttons.append([
        InlineKeyboardButton(text="📤 Надіслати квитанцію / скріншот", callback_data=f"upload_receipt:{booking_id}")
    ])
    buttons.append([
        InlineKeyboardButton(text="ℹ️ Деталі бронювання", callback_data=f"booking_info:{booking_id}")
    ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)
