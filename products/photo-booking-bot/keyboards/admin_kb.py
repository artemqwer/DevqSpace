from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from typing import List, Dict, Any

def admin_main_kb() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="📋 Заявки та записи", callback_data="adm_bookings"),
            InlineKeyboardButton(text="📸 Послуги та ціни", callback_data="adm_services"),
        ],
        [
            InlineKeyboardButton(text="🖼 Портфоліо", callback_data="adm_portfolio"),
            InlineKeyboardButton(text="⚙️ Профіль та контакти", callback_data="adm_profile"),
        ],
        [
            InlineKeyboardButton(text="💳 Реквізити та завдаток", callback_data="adm_payments"),
            InlineKeyboardButton(text="🚫 Графік та вихідні", callback_data="adm_schedule"),
        ],
        [
            InlineKeyboardButton(text="📝 Гайд для клієнта", callback_data="adm_guide"),
            InlineKeyboardButton(text="⏰ Авто-нагадування", callback_data="adm_reminders"),
        ],
        [
            InlineKeyboardButton(text="📢 Розсилка клієнтам", callback_data="adm_broadcast"),
            InlineKeyboardButton(text="👥 Керування адмінами", callback_data="adm_admins"),
        ],
        [
            InlineKeyboardButton(text="🔄 Оновити дані / статус", callback_data="adm_refresh"),
            InlineKeyboardButton(text="🚪 Закрити меню", callback_data="adm_close"),
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_services_list_kb(services: List[Dict[str, Any]]) -> InlineKeyboardMarkup:
    buttons = []
    for s in services:
        status_icon = "🟢" if s.get("is_active", 1) else "🔴"
        buttons.append([
            InlineKeyboardButton(
                text=f"{status_icon} {s['title']} ({s['price']} грн)",
                callback_data=f"adm_serv_view:{s['id']}"
            )
        ])
    buttons.append([InlineKeyboardButton(text="➕ Додати нову послугу", callback_data="adm_serv_add")])
    buttons.append([InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_service_edit_kb(service_id: int, is_active: bool) -> InlineKeyboardMarkup:
    toggle_label = "🔴 Вимкнути показ" if is_active else "🟢 Увімкнути показ"
    buttons = [
        [
            InlineKeyboardButton(text="✏️ Змінити назву", callback_data=f"adm_serv_edit:title:{service_id}"),
            InlineKeyboardButton(text="💵 Змінити ціну", callback_data=f"adm_serv_edit:price:{service_id}"),
        ],
        [
            InlineKeyboardButton(text="💳 Завдаток", callback_data=f"adm_serv_edit:deposit:{service_id}"),
            InlineKeyboardButton(text="⏱ Тривалість", callback_data=f"adm_serv_edit:dur:{service_id}"),
        ],
        [
            InlineKeyboardButton(text="📝 Змінити опис", callback_data=f"adm_serv_edit:desc:{service_id}"),
            InlineKeyboardButton(text=toggle_label, callback_data=f"adm_serv_toggle:{service_id}"),
        ],
        [
            InlineKeyboardButton(text="🗑 Видалити послугу", callback_data=f"adm_serv_del:{service_id}"),
        ],
        [
            InlineKeyboardButton(text="⬅️ До списку послуг", callback_data="adm_services"),
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_profile_kb() -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text="✏️ Ім'я фотографа / студії", callback_data="adm_prof:photographer_name")],
        [InlineKeyboardButton(text="✏️ Привітальне повідомлення", callback_data="adm_prof:welcome_text")],
        [
            InlineKeyboardButton(text="✏️ Telegram", callback_data="adm_prof:contact_telegram"),
            InlineKeyboardButton(text="✏️ Instagram", callback_data="adm_prof:contact_instagram"),
        ],
        [
            InlineKeyboardButton(text="✏️ Телефон", callback_data="adm_prof:contact_phone"),
            InlineKeyboardButton(text="✏️ Веб-сайт", callback_data="adm_prof:contact_website"),
        ],
        [InlineKeyboardButton(text="📍 Список локацій", callback_data="adm_prof:locations_text")],
        [InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_payments_kb(deposit_enabled: bool) -> InlineKeyboardMarkup:
    toggle_text = "🟢 Завдаток обов'язковий" if deposit_enabled else "🔴 Завдаток вимкнено"
    buttons = [
        [InlineKeyboardButton(text=f"Статус: {toggle_text}", callback_data="adm_pay_toggle_deposit")],
        [InlineKeyboardButton(text="💳 Номер картки (текст)", callback_data="adm_pay:card_number")],
        [InlineKeyboardButton(text="🏦 Посилання на банку Monobank", callback_data="adm_pay:monobank_jar_url")],
        [InlineKeyboardButton(text="💵 Стандартний розмір завдатку", callback_data="adm_pay:default_deposit_amount")],
        [InlineKeyboardButton(text="📝 Інструкція з оплати для клієнта", callback_data="adm_pay:payment_instructions")],
        [InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_guide_kb() -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text="✏️ Змінити текст гайду", callback_data="adm_guide_edit")],
        [InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_reminders_kb(rem_24_on: bool, rem_2_on: bool) -> InlineKeyboardMarkup:
    b24 = "🟢 24 год увімкнено" if rem_24_on else "🔴 24 год вимкнено"
    b2 = "🟢 2 год увімкнено" if rem_2_on else "🔴 2 год вимкнено"
    buttons = [
        [InlineKeyboardButton(text=b24, callback_data="adm_rem_toggle:24")],
        [InlineKeyboardButton(text="✏️ Текст нагадування за 24г", callback_data="adm_rem_edit:24")],
        [InlineKeyboardButton(text=b2, callback_data="adm_rem_toggle:2")],
        [InlineKeyboardButton(text="✏️ Текст нагадування за 2г", callback_data="adm_rem_edit:2")],
        [InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_portfolio_cats_kb(categories: List[str]) -> InlineKeyboardMarkup:
    buttons = []
    for cat in categories:
        buttons.append([
            InlineKeyboardButton(text=f"📁 {cat}", callback_data=f"adm_port_cat:{cat}")
        ])
    buttons.append([InlineKeyboardButton(text="➕ Додати фото в портфоліо", callback_data="adm_port_add")])
    buttons.append([InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_booking_card_kb(booking_id: int, current_status: str, deposit_paid: bool) -> InlineKeyboardMarkup:
    buttons = []
    if current_status == "PENDING":
        buttons.append([
            InlineKeyboardButton(text="✅ Підтвердити запис", callback_data=f"adm_b_status:{booking_id}:CONFIRMED"),
            InlineKeyboardButton(text="❌ Відхилити", callback_data=f"adm_b_status:{booking_id}:CANCELLED")
        ])
    if not deposit_paid:
        buttons.append([
            InlineKeyboardButton(text="💵 Завдаток отримано (Оплачено)", callback_data=f"adm_b_pay:{booking_id}:1")
        ])
    else:
        buttons.append([
            InlineKeyboardButton(text="↩️ Скасувати статус оплати", callback_data=f"adm_b_pay:{booking_id}:0")
        ])

    if current_status == "CONFIRMED":
        buttons.append([
            InlineKeyboardButton(text="🏁 Завершено (Зйомка пройшла)", callback_data=f"adm_b_status:{booking_id}:COMPLETED"),
            InlineKeyboardButton(text="❌ Скасувати", callback_data=f"adm_b_status:{booking_id}:CANCELLED")
        ])

    buttons.append([InlineKeyboardButton(text="⬅️ До списку записів", callback_data="adm_bookings")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_cancel_action_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❌ Скасувати редагування", callback_data="adm_cancel_fsm")]
    ])
