import logging
from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from database.models import (
    is_admin, add_admin, list_admins, remove_admin,
    get_setting, set_setting, get_all_settings,
    get_services, get_service, add_service, update_service, delete_service,
    get_portfolio_categories, get_portfolio_by_category, add_portfolio_item, delete_portfolio_item,
    get_recent_bookings, get_booking, update_booking_status,
    block_slot, unblock_slot, get_all_clients
)
from keyboards.admin_kb import (
    admin_main_kb, admin_services_list_kb, admin_service_edit_kb,
    admin_profile_kb, admin_payments_kb, admin_guide_kb, admin_reminders_kb,
    admin_portfolio_cats_kb, admin_booking_card_kb, admin_cancel_action_kb
)
from keyboards.client_kb import main_menu_kb

logger = logging.getLogger(__name__)
admin_router = Router()

# ==================== FSM STATES ====================

class AdminFSM(StatesGroup):
    entering_pin = State()
    editing_setting = State()
    # Services
    adding_service_title = State()
    adding_service_desc = State()
    adding_service_price = State()
    adding_service_deposit = State()
    adding_service_dur = State()
    editing_service_field = State()
    # Portfolio
    adding_port_cat = State()
    adding_port_photo = State()
    adding_port_caption = State()
    # Schedule
    blocking_date = State()
    blocking_reason = State()
    # Broadcast
    entering_broadcast_text = State()
    # Admins
    adding_admin_id = State()
    changing_pin = State()

# ==================== AUTH & MAIN MENU ====================

@admin_router.message(Command("admin"))
async def cmd_admin(message: Message, state: FSMContext):
    await state.clear()
    user = message.from_user
    if not user:
        return

    admin_ok = await is_admin(user.id)
    if not admin_ok:
        # Якщо в базі взагалі немає жодного адміна — перший стає адміном автоматично!
        admins = await list_admins()
        if not admins:
            await add_admin(user.id, user.username or user.first_name)
            await set_setting("super_admin_id", str(user.id))
            await message.answer("👑 <b>Ви зареєстровані як головний адміністратор бота!</b>", parse_mode="HTML")
            await show_admin_panel(message)
            return

        await message.answer(
            "🔒 <b>Вхід в панель керування фотографа</b>\n\n"
            "Введіть 4-значний PIN-код адміністратора (за замовчуванням: <code>7788</code>):",
            parse_mode="HTML"
        )
        await state.set_state(AdminFSM.entering_pin)
        return

    await show_admin_panel(message)

@admin_router.message(AdminFSM.entering_pin)
async def check_pin(message: Message, state: FSMContext):
    pin_input = message.text.strip()
    saved_pin = await get_setting("admin_pin", "7788")

    if pin_input == saved_pin:
        user = message.from_user
        await add_admin(user.id, user.username or user.first_name)
        await state.clear()
        await message.answer("✅ <b>Успішний вхід!</b> Ви додані до списку адміністраторів.", parse_mode="HTML")
        await show_admin_panel(message)
    else:
        await message.answer("❌ Невірний PIN-код. Спробуйте ще раз або введіть /start для виходу:")

async def show_admin_panel(message: Message | CallbackQuery):
    photographer = await get_setting("photographer_name", "Фотограф")
    bookings = await get_recent_bookings(10)
    pending_count = sum(1 for b in bookings if b["status"] == "PENDING")
    clients = await get_all_clients()

    text = (
        f"👑 <b>Панель керування фотографа: {photographer}</b>\n\n"
        f"📊 <b>Статистика</b>:\n"
        f"• Нових заявок: <b>{pending_count}</b>\n"
        f"• Всього клієнтів у базі: <b>{len(clients)}</b>\n\n"
        f"Оберіть розділ для налаштування 👇"
    )

    if isinstance(message, CallbackQuery):
        await message.answer()
        await message.message.edit_text(text, reply_markup=admin_main_kb(), parse_mode="HTML")
    else:
        await message.answer(text, reply_markup=admin_main_kb(), parse_mode="HTML")

@admin_router.callback_query(F.data == "adm_main")
async def cb_admin_main(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await show_admin_panel(callback)

@admin_router.callback_query(F.data == "adm_close")
async def cb_admin_close(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.answer("Панель закрито")
    await callback.message.delete()
    await callback.message.answer("Головне меню клієнта 👇", reply_markup=main_menu_kb())

@admin_router.callback_query(F.data == "adm_cancel_fsm")
async def cb_admin_cancel_fsm(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.answer("Редагування скасовано")
    await show_admin_panel(callback)

# ==================== 1. PROFILE & CONTACTS ====================

@admin_router.callback_query(F.data == "adm_profile")
async def cb_admin_profile(callback: CallbackQuery):
    name = await get_setting("photographer_name")
    welcome = await get_setting("welcome_text")
    tg = await get_setting("contact_telegram")
    inst = await get_setting("contact_instagram")
    phone = await get_setting("contact_phone")
    web = await get_setting("contact_website")

    text = (
        "⚙️ <b>Налаштування профілю та контактів</b>\n\n"
        f"• <b>Ім'я / бренд</b>: {name}\n"
        f"• <b>Telegram</b>: {tg}\n"
        f"• <b>Instagram</b>: {inst}\n"
        f"• <b>Телефон</b>: {phone}\n"
        f"• <b>Сайт</b>: {web}\n\n"
        "Оберіть, що бажаєте змінити 👇"
    )
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=admin_profile_kb(), parse_mode="HTML")

@admin_router.callback_query(F.data.startswith("adm_prof:"))
async def cb_admin_edit_profile_field(callback: CallbackQuery, state: FSMContext):
    field_key = callback.data.split(":", 1)[1]
    labels = {
        "photographer_name": "Ім'я фотографа чи назву фотостудії",
        "welcome_text": "Нове привітальне повідомлення (вітання у /start)",
        "contact_telegram": "Telegram нікнейм (наприклад @my_photo)",
        "contact_instagram": "Instagram нікнейм (наприклад @my.studio)",
        "contact_phone": "Номер телефону для клієнтів",
        "contact_website": "Адресу веб-сайту чи портфоліо",
        "locations_text": "Список популярних локацій (підтримує HTML-теги <b>, <i>)"
    }
    label = labels.get(field_key, field_key)
    await state.update_data(editing_setting_key=field_key)

    await callback.answer()
    await callback.message.answer(
        f"Введіть нове значення для поля <b>{label}</b>:",
        reply_markup=admin_cancel_action_kb(),
        parse_mode="HTML"
    )
    await state.set_state(AdminFSM.editing_setting)

@admin_router.message(AdminFSM.editing_setting)
async def process_save_setting(message: Message, state: FSMContext):
    data = await state.get_data()
    key = data.get("editing_setting_key")
    if not key:
        await state.clear()
        return

    new_val = message.text.strip()
    await set_setting(key, new_val)
    await state.clear()

    await message.answer(f"✅ Налаштування <b>{key}</b> успішно збережено!", parse_mode="HTML")
    await show_admin_panel(message)

# ==================== 2. SERVICES & PACKAGES ====================

@admin_router.callback_query(F.data == "adm_services")
async def cb_admin_services(callback: CallbackQuery):
    services = await get_services(active_only=False)
    text = (
        "📸 <b>Керування послугами та цінами</b>\n\n"
        "Тут ви можете додавати пакети фотосесій, змінювати вартість, завдаток, тривалість або вимикати тимчасово неактивні.\n"
        "Натисніть на послугу для редагування 👇"
    )
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=admin_services_list_kb(services), parse_mode="HTML")

@admin_router.callback_query(F.data.startswith("adm_serv_view:"))
async def cb_admin_service_view(callback: CallbackQuery):
    service_id = int(callback.data.split(":", 1)[1])
    s = await get_service(service_id)
    if not s:
        await callback.answer("Послугу не знайдено", show_alert=True)
        return

    status = "🟢 Відображається в боті" if s.get("is_active", 1) else "🔴 Приховано від клієнтів"
    text = (
        f"📸 <b>{s['title']}</b>\n\n"
        f"• <b>Ціна</b>: {s['price']} грн\n"
        f"• <b>Завдаток</b>: {s.get('deposit', 500)} грн\n"
        f"• <b>Тривалість</b>: {s.get('duration_min', 60)} хв\n"
        f"• <b>Статус</b>: {status}\n\n"
        f"📝 <b>Опис</b>:\n{s['description']}\n\n"
        "Оберіть дію нижче 👇"
    )
    await callback.answer()
    await callback.message.edit_text(
        text,
        reply_markup=admin_service_edit_kb(service_id, bool(s.get("is_active", 1))),
        parse_mode="HTML"
    )

@admin_router.callback_query(F.data.startswith("adm_serv_toggle:"))
async def cb_admin_serv_toggle(callback: CallbackQuery):
    service_id = int(callback.data.split(":", 1)[1])
    s = await get_service(service_id)
    if s:
        new_val = 0 if s.get("is_active", 1) else 1
        await update_service(service_id, is_active=new_val)
        await callback.answer("Статус змінено!")
    await cb_admin_service_view(callback)

@admin_router.callback_query(F.data.startswith("adm_serv_del:"))
async def cb_admin_serv_del(callback: CallbackQuery):
    service_id = int(callback.data.split(":", 1)[1])
    await delete_service(service_id)
    await callback.answer("Послугу видалено!", show_alert=True)
    await cb_admin_services(callback)

@admin_router.callback_query(F.data.startswith("adm_serv_edit:"))
async def cb_admin_serv_edit_field(callback: CallbackQuery, state: FSMContext):
    parts = callback.data.split(":")
    field = parts[1]
    service_id = int(parts[2])

    await state.update_data(editing_service_id=service_id, editing_service_field=field)
    field_names = {
        "title": "нову назву послуги",
        "price": "нову ціну (лише число у грн, наприклад 2500)",
        "deposit": "новий розмір завдатку (число у грн, наприклад 500)",
        "dur": "тривалість у хвилинах (наприклад 60 або 90)",
        "desc": "новий опис пакету"
    }
    await callback.answer()
    await callback.message.answer(
        f"Введіть {field_names.get(field, field)}:",
        reply_markup=admin_cancel_action_kb()
    )
    await state.set_state(AdminFSM.editing_service_field)

@admin_router.message(AdminFSM.editing_service_field)
async def process_service_field_save(message: Message, state: FSMContext):
    data = await state.get_data()
    service_id = data.get("editing_service_id")
    field = data.get("editing_service_field")
    val = message.text.strip()

    if field == "price":
        val = int(val) if val.isdigit() else 1000
        await update_service(service_id, price=val)
    elif field == "deposit":
        val = int(val) if val.isdigit() else 500
        await update_service(service_id, deposit=val)
    elif field == "dur":
        val = int(val) if val.isdigit() else 60
        await update_service(service_id, duration_min=val)
    elif field == "title":
        await update_service(service_id, title=val)
    elif field == "desc":
        await update_service(service_id, description=val)

    await state.clear()
    await message.answer("✅ Послугу оновлено!")
    s = await get_service(service_id)
    if s:
        status = "🟢 Відображається в боті" if s.get("is_active", 1) else "🔴 Приховано від клієнтів"
        text = (
            f"📸 <b>{s['title']}</b>\n\n"
            f"• <b>Ціна</b>: {s['price']} грн\n"
            f"• <b>Завдаток</b>: {s.get('deposit', 500)} грн\n"
            f"• <b>Тривалість</b>: {s.get('duration_min', 60)} хв\n"
            f"• <b>Статус</b>: {status}\n\n"
            f"📝 <b>Опис</b>:\n{s['description']}"
        )
        await message.answer(text, reply_markup=admin_service_edit_kb(service_id, bool(s.get("is_active", 1))), parse_mode="HTML")

# --- Додавання нової послуги ---
@admin_router.callback_query(F.data == "adm_serv_add")
async def cb_admin_serv_add_start(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer(
        "➕ <b>Додавання нової послуги</b>\nКрок 1/5: Введіть назву послуги (наприклад «Експрес фотосесія»):",
        reply_markup=admin_cancel_action_kb(),
        parse_mode="HTML"
    )
    await state.set_state(AdminFSM.adding_service_title)

@admin_router.message(AdminFSM.adding_service_title)
async def add_serv_step1(message: Message, state: FSMContext):
    await state.update_data(new_title=message.text.strip())
    await message.answer("Крок 2/5: Введіть опис послуги (що входить у вартість):")
    await state.set_state(AdminFSM.adding_service_desc)

@admin_router.message(AdminFSM.adding_service_desc)
async def add_serv_step2(message: Message, state: FSMContext):
    await state.update_data(new_desc=message.text.strip())
    await message.answer("Крок 3/5: Введіть повну вартість (лише число у грн, наприклад 2000):")
    await state.set_state(AdminFSM.adding_service_price)

@admin_router.message(AdminFSM.adding_service_price)
async def add_serv_step3(message: Message, state: FSMContext):
    val = int(message.text.strip()) if message.text.strip().isdigit() else 1000
    await state.update_data(new_price=val)
    await message.answer("Крок 4/5: Введіть розмір завдатку (число у грн, наприклад 500):")
    await state.set_state(AdminFSM.adding_service_deposit)

@admin_router.message(AdminFSM.adding_service_deposit)
async def add_serv_step4(message: Message, state: FSMContext):
    val = int(message.text.strip()) if message.text.strip().isdigit() else 500
    await state.update_data(new_deposit=val)
    await message.answer("Крок 5/5: Введіть тривалість зйомки у хвилинах (наприклад 60 або 120):")
    await state.set_state(AdminFSM.adding_service_dur)

@admin_router.message(AdminFSM.adding_service_dur)
async def add_serv_finish(message: Message, state: FSMContext):
    dur = int(message.text.strip()) if message.text.strip().isdigit() else 60
    data = await state.get_data()
    await state.clear()

    serv_id = await add_service(
        title=data["new_title"],
        description=data["new_desc"],
        price=data["new_price"],
        deposit=data["new_deposit"],
        duration_min=dur
    )

    await message.answer(f"🎉 <b>Послугу «{data['new_title']}» успішно створено!</b>", parse_mode="HTML")
    await show_admin_panel(message)

# ==================== 3. PORTFOLIO ====================

@admin_router.callback_query(F.data == "adm_portfolio")
async def cb_admin_portfolio(callback: CallbackQuery):
    categories = await get_portfolio_categories()
    text = (
        "🖼 <b>Керування портфоліо</b>\n\n"
        "Тут ви можете додавати фото прямо з телефону або комп'ютера у відповідні категорії робіт."
    )
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=admin_portfolio_cats_kb(categories), parse_mode="HTML")

@admin_router.callback_query(F.data.startswith("adm_port_cat:"))
async def cb_admin_port_view_cat(callback: CallbackQuery):
    cat = callback.data.split(":", 1)[1]
    items = await get_portfolio_by_category(cat)

    await callback.answer()
    if not items:
        await callback.message.answer(f"У категорії «{cat}» ще немає фотографій.")
        return

    await callback.message.answer(f"📁 Фотографії в категорії <b>{cat}</b> (всього {len(items)}):", parse_mode="HTML")
    for it in items[:5]:
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
        del_kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🗑 Видалити це фото", callback_data=f"adm_port_del:{it['id']}")]
        ])
        try:
            await callback.message.answer_photo(
                photo=it["file_id"],
                caption=it.get("caption") or f"Категорія: {cat}",
                reply_markup=del_kb
            )
        except Exception as e:
            logger.warning(f"Error rendering admin photo: {e}")

@admin_router.callback_query(F.data.startswith("adm_port_del:"))
async def cb_admin_port_del(callback: CallbackQuery):
    item_id = int(callback.data.split(":", 1)[1])
    await delete_portfolio_item(item_id)
    await callback.answer("Фото видалено!", show_alert=True)
    try:
        await callback.message.delete()
    except Exception:
        pass

@admin_router.callback_query(F.data == "adm_port_add")
async def cb_admin_port_add_start(callback: CallbackQuery, state: FSMContext):
    categories = await get_portfolio_categories()
    await callback.answer()
    await callback.message.answer(
        "➕ <b>Додавання фото в портфоліо</b>\nКрок 1/3: Вкажіть категорію (наприклад «Індивідуальна», «Love Story», «Студійна»):",
        reply_markup=admin_cancel_action_kb(),
        parse_mode="HTML"
    )
    await state.set_state(AdminFSM.adding_port_cat)

@admin_router.message(AdminFSM.adding_port_cat)
async def add_port_step1(message: Message, state: FSMContext):
    cat = message.text.strip()
    await state.update_data(port_cat=cat)
    await message.answer("Крок 2/3: Надішліть фотографію (як фото, не файлом):")
    await state.set_state(AdminFSM.adding_port_photo)

@admin_router.message(AdminFSM.adding_port_photo, F.photo)
async def add_port_step2(message: Message, state: FSMContext):
    photo_id = message.photo[-1].file_id
    await state.update_data(port_photo_id=photo_id)
    await message.answer("Крок 3/3: Введіть короткий підпис до фото (або напишіть «-» якщо без підпису):")
    await state.set_state(AdminFSM.adding_port_caption)

@admin_router.message(AdminFSM.adding_port_caption)
async def add_port_finish(message: Message, state: FSMContext):
    caption = message.text.strip()
    if caption == "-":
        caption = ""
    data = await state.get_data()
    await state.clear()

    await add_portfolio_item(
        category=data["port_cat"],
        file_id=data["port_photo_id"],
        caption=caption
    )
    await message.answer(f"🎉 <b>Фото успішно додано до категорії «{data['port_cat']}»!</b>", parse_mode="HTML")
    await show_admin_panel(message)

# ==================== 4. BOOKINGS MANAGER ====================

@admin_router.callback_query(F.data == "adm_bookings")
async def cb_admin_bookings(callback: CallbackQuery):
    bookings = await get_recent_bookings(15)
    await callback.answer()

    if not bookings:
        await callback.message.edit_text("Поки немає жодного запису.", reply_markup=admin_main_kb())
        return

    text = "📋 <b>Останні записи на зйомку</b>:\nНатисніть на запис для перегляду та підтвердження 👇"
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    buttons = []
    for b in bookings:
        status_icons = {
            "PENDING": "⏳ Очікує",
            "CONFIRMED": "✅ Підтверджено",
            "PAID": "💵 Оплачено",
            "CANCELLED": "❌ Скасовано",
            "COMPLETED": "🏁 Завершено"
        }
        st = status_icons.get(b["status"], b["status"])
        buttons.append([
            InlineKeyboardButton(
                text=f"#{b['id']} · {b['booking_date']} {b['booking_time']} · {st}",
                callback_data=f"adm_b_view:{b['id']}"
            )
        ])
    buttons.append([InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")])

    await callback.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons), parse_mode="HTML")

@admin_router.callback_query(F.data.startswith("adm_b_view:"))
async def cb_admin_booking_view(callback: CallbackQuery):
    b_id = int(callback.data.split(":", 1)[1])
    b = await get_booking(b_id)
    if not b:
        await callback.answer("Запис не знайдено", show_alert=True)
        return

    text = (
        f"📋 <b>ЗАПИС #{b['id']}</b>\n\n"
        f"📸 <b>Пакет</b>: {b['service_title']}\n"
        f"📅 <b>Дата та час</b>: {b['booking_date']} о {b['booking_time']}\n"
        f"👤 <b>Клієнт</b>: {b['user_name']}\n"
        f"📞 <b>Контакт</b>: <code>{b['user_contact']}</code>\n"
        f"📍 <b>Локація/побажання</b>: {b.get('location') or 'не вказано'}\n"
        f"🏷 <b>Статус</b>: <b>{b['status']}</b>\n"
        f"💳 <b>Завдаток</b>: {'✅ Оплачено' if b.get('deposit_paid') else '⏳ Очікує оплати'}\n"
        f"🕐 Створено: {b['created_at']}\n"
    )

    await callback.answer()
    if b.get("receipt_file_id"):
        try:
            await callback.message.answer_photo(
                photo=b["receipt_file_id"],
                caption=f"🧾 Квитанція до запису #{b['id']}"
            )
        except Exception as e:
            logger.warning(f"Error showing receipt photo: {e}")

    await callback.message.answer(
        text,
        reply_markup=admin_booking_card_kb(b["id"], b["status"], bool(b.get("deposit_paid"))),
        parse_mode="HTML"
    )

@admin_router.callback_query(F.data.startswith("adm_b_status:"))
async def cb_admin_b_status(callback: CallbackQuery, bot: Bot):
    parts = callback.data.split(":")
    b_id = int(parts[1])
    new_status = parts[2]

    await update_booking_status(b_id, new_status)
    await callback.answer(f"Статус оновлено на {new_status}!")

    b = await get_booking(b_id)
    if b and b.get("user_id"):
        # Сповіщаємо клієнта про зміну статусу
        if new_status == "CONFIRMED":
            prep_guide = await get_setting("prep_guide_text")
            msg = (
                f"🎉 <b>Ваш запис #{b_id} на {b['booking_date']} о {b['booking_time']} підтверджено фотографом!</b>\n\n"
                f"Час зафіксовано. Нижче надсилаємо гайд підготовки до зйомки 👇\n\n"
                f"{prep_guide}"
            )
            try:
                await bot.send_message(b["user_id"], msg, parse_mode="HTML")
            except Exception:
                pass
        elif new_status == "CANCELLED":
            msg = f"❌ На жаль, ваш запис #{b_id} було скасовано фотографом. Зв'яжіться з нами для узгодження іншої дати."
            try:
                await bot.send_message(b["user_id"], msg, parse_mode="HTML")
            except Exception:
                pass

    await cb_admin_bookings(callback)

@admin_router.callback_query(F.data.startswith("adm_b_pay:"))
async def cb_admin_b_pay(callback: CallbackQuery, bot: Bot):
    parts = callback.data.split(":")
    b_id = int(parts[1])
    paid_val = int(parts[2])

    await update_booking_status(b_id, "PAID" if paid_val else "CONFIRMED", deposit_paid=paid_val)
    await callback.answer("Статус оплати завдатку оновлено!")

    b = await get_booking(b_id)
    if b and b.get("user_id") and paid_val == 1:
        try:
            await bot.send_message(
                b["user_id"],
                f"✅ <b>Завдаток за запис #{b_id} успішно зараховано!</b>\nДякуємо! Чекаємо вас на зйомці {b['booking_date']} о {b['booking_time']}.",
                parse_mode="HTML"
            )
        except Exception:
            pass

    await cb_admin_bookings(callback)

# ==================== 5. PAYMENTS & REQUISITES ====================

@admin_router.callback_query(F.data == "adm_payments")
async def cb_admin_payments(callback: CallbackQuery):
    dep_on = (await get_setting("deposit_enabled", "true")) == "true"
    card = await get_setting("card_number")
    jar = await get_setting("monobank_jar_url")
    amount = await get_setting("default_deposit_amount", "500")

    text = (
        "💳 <b>Налаштування реквізитів та завдатку</b>\n\n"
        f"• <b>Обов'язковий завдаток</b>: {'🟢 Так' if dep_on else '🔴 Ні (запис без завдатку)'}\n"
        f"• <b>Номер картки</b>: <code>{card}</code>\n"
        f"• <b>Банка Monobank</b>: {jar}\n"
        f"• <b>Розмір завдатку за замовчуванням</b>: {amount} грн\n\n"
        "Натисніть кнопку для зміни потрібного параметру 👇"
    )
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=admin_payments_kb(dep_on), parse_mode="HTML")

@admin_router.callback_query(F.data == "adm_pay_toggle_deposit")
async def cb_admin_toggle_deposit(callback: CallbackQuery):
    dep_on = (await get_setting("deposit_enabled", "true")) == "true"
    new_val = "false" if dep_on else "true"
    await set_setting("deposit_enabled", new_val)
    await callback.answer("Налаштування оновлено!")
    await cb_admin_payments(callback)

@admin_router.callback_query(F.data.startswith("adm_pay:"))
async def cb_admin_edit_pay_field(callback: CallbackQuery, state: FSMContext):
    field_key = callback.data.split(":", 1)[1]
    labels = {
        "card_number": "номер банківської картки (наприклад 4441... Monobank / Олена)",
        "monobank_jar_url": "посилання на банку Monobank (наприклад https://send.monobank.ua/jar/...)",
        "default_deposit_amount": "суму завдатку у грн (наприклад 500)",
        "payment_instructions": "інструкцію з оплати для клієнтів"
    }
    await state.update_data(editing_setting_key=field_key)
    await callback.answer()
    await callback.message.answer(
        f"Введіть {labels.get(field_key, field_key)}:",
        reply_markup=admin_cancel_action_kb()
    )
    await state.set_state(AdminFSM.editing_setting)

# ==================== 6. SCHEDULE & DAYS OFF ====================

@admin_router.callback_query(F.data == "adm_schedule")
async def cb_admin_schedule(callback: CallbackQuery):
    text = (
        "🚫 <b>Графік та вихідні</b>\n\n"
        "Тут ви можете заблокувати будь-яку дату (відпустка, лікарняний, вихідний), "
        "щоб клієнти не могли обрати цей день у календарі."
    )
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    buttons = [
        [InlineKeyboardButton(text="🚫 Заблокувати дату (зробити вихідним)", callback_data="adm_sched_block")],
        [InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")]
    ]
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons), parse_mode="HTML")

@admin_router.callback_query(F.data == "adm_sched_block")
async def cb_admin_sched_block_start(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer(
        "Введіть дату, яку потрібно заблокувати у форматі <b>РРРР-ММ-ДД</b> (наприклад <code>2026-10-15</code>):",
        reply_markup=admin_cancel_action_kb(),
        parse_mode="HTML"
    )
    await state.set_state(AdminFSM.blocking_date)

@admin_router.message(AdminFSM.blocking_date)
async def block_date_step(message: Message, state: FSMContext):
    date_val = message.text.strip()
    await block_slot(date_val, time_str="", reason="Вихідний фотографа")
    await state.clear()
    await message.answer(f"✅ Дату <b>{date_val}</b> заблоковано! Клієнти не зможуть записатися на цей день.", parse_mode="HTML")
    await show_admin_panel(message)

# ==================== 7. PREP GUIDE ====================

@admin_router.callback_query(F.data == "adm_guide")
async def cb_admin_guide(callback: CallbackQuery):
    guide = await get_setting("prep_guide_text")
    text = (
        "📝 <b>Гайд підготовки до фотосесії</b>\n\n"
        "Цей текст автоматично надсилається кожному клієнту після успішного підтвердження бронювання:\n\n"
        f"{guide}"
    )
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=admin_guide_kb(), parse_mode="HTML")

@admin_router.callback_query(F.data == "adm_guide_edit")
async def cb_admin_guide_edit(callback: CallbackQuery, state: FSMContext):
    await state.update_data(editing_setting_key="prep_guide_text")
    await callback.answer()
    await callback.message.answer(
        "Введіть новий повний текст гайду (можна використовувати емодзі та оформлення):",
        reply_markup=admin_cancel_action_kb()
    )
    await state.set_state(AdminFSM.editing_setting)

# ==================== 8. REMINDERS ====================

@admin_router.callback_query(F.data == "adm_reminders")
async def cb_admin_reminders(callback: CallbackQuery):
    r24 = (await get_setting("reminder_24h_enabled", "true")) == "true"
    r2 = (await get_setting("reminder_2h_enabled", "true")) == "true"
    t24 = await get_setting("reminder_24h_text")
    t2 = await get_setting("reminder_2h_text")

    text = (
        "⏰ <b>Автоматичні нагадування клієнтам</b>\n\n"
        f"• Нагадування за 24 години: {'🟢 Увімкнено' if r24 else '🔴 Вимкнено'}\n"
        f"  <i>Шаблон: {t24[:60]}...</i>\n\n"
        f"• Нагадування за 2 години: {'🟢 Увімкнено' if r2 else '🔴 Вимкнено'}\n"
        f"  <i>Шаблон: {t2[:60]}...</i>\n"
    )
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=admin_reminders_kb(r24, r2), parse_mode="HTML")

@admin_router.callback_query(F.data.startswith("adm_rem_toggle:"))
async def cb_admin_rem_toggle(callback: CallbackQuery):
    hours = callback.data.split(":", 1)[1]
    key = f"reminder_{hours}h_enabled"
    cur = (await get_setting(key, "true")) == "true"
    await set_setting(key, "false" if cur else "true")
    await callback.answer("Налаштування нагадування змінено!")
    await cb_admin_reminders(callback)

@admin_router.callback_query(F.data.startswith("adm_rem_edit:"))
async def cb_admin_rem_edit(callback: CallbackQuery, state: FSMContext):
    hours = callback.data.split(":", 1)[1]
    key = f"reminder_{hours}h_text"
    await state.update_data(editing_setting_key=key)
    await callback.answer()
    await callback.message.answer(
        f"Введіть новий текст нагадування за {hours} год.\n"
        "Доступні змінні: <code>{date}</code>, <code>{time}</code>, <code>{service}</code>, <code>{location}</code>:",
        reply_markup=admin_cancel_action_kb(),
        parse_mode="HTML"
    )
    await state.set_state(AdminFSM.editing_setting)

# ==================== 9. BROADCAST ====================

@admin_router.callback_query(F.data == "adm_broadcast")
async def cb_admin_broadcast(callback: CallbackQuery, state: FSMContext):
    clients = await get_all_clients()
    await callback.answer()
    await callback.message.answer(
        f"📢 <b>Розсилка повідомлення клієнтам</b>\n\n"
        f"Зараз у базі: <b>{len(clients)}</b> користувачів.\n"
        "Введіть текст оголошення, який буде надіслано всім клієнтам:",
        reply_markup=admin_cancel_action_kb(),
        parse_mode="HTML"
    )
    await state.set_state(AdminFSM.entering_broadcast_text)

@admin_router.message(AdminFSM.entering_broadcast_text)
async def process_broadcast(message: Message, state: FSMContext, bot: Bot):
    text = message.text
    await state.clear()

    clients = await get_all_clients()
    sent = 0
    failed = 0

    status_msg = await message.answer(f"⏳ Розсилка розпочата... (0/{len(clients)})")

    for c in clients:
        try:
            await bot.send_message(c["user_id"], text, parse_mode="HTML")
            sent += 1
        except Exception:
            failed += 1

    await status_msg.edit_text(f"✅ <b>Розсилку завершено!</b>\nУспішно надіслано: <b>{sent}</b>\nНе вдалося: {failed}", parse_mode="HTML")
    await show_admin_panel(message)

# ==================== 10. ADMINS MANAGEMENT ====================

@admin_router.callback_query(F.data == "adm_admins")
async def cb_admin_admins(callback: CallbackQuery):
    admins = await list_admins()
    pin = await get_setting("admin_pin", "7788")

    text = (
        "👥 <b>Керування адміністраторами</b>\n\n"
        f"🔑 Поточний PIN-код для входу: <code>{pin}</code>\n\n"
        "Список діючих адмінів:\n"
    )
    for a in admins:
        text += f"• ID: <code>{a['user_id']}</code> (@{a.get('username') or 'без юзернейму'})\n"

    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    buttons = [
        [InlineKeyboardButton(text="➕ Додати нового адміна", callback_data="adm_add_admin")],
        [InlineKeyboardButton(text="🔑 Змінити PIN-код", callback_data="adm_change_pin")],
        [InlineKeyboardButton(text="⬅️ Головне меню адмінки", callback_data="adm_main")]
    ]
    await callback.answer()
    await callback.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons), parse_mode="HTML")

@admin_router.callback_query(F.data == "adm_add_admin")
async def cb_admin_add_admin_start(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer(
        "Введіть числовий Telegram ID користувача (можна дізнатися у @userinfobot):",
        reply_markup=admin_cancel_action_kb()
    )
    await state.set_state(AdminFSM.adding_admin_id)

@admin_router.message(AdminFSM.adding_admin_id)
async def process_add_admin(message: Message, state: FSMContext):
    text = message.text.strip()
    if not text.isdigit():
        await message.answer("ID має бути числом. Спробуйте ще раз:")
        return

    uid = int(text)
    await add_admin(uid, "Admin")
    await state.clear()
    await message.answer(f"✅ Адміністратора <code>{uid}</code> успішно додано!", parse_mode="HTML")
    await show_admin_panel(message)

@admin_router.callback_query(F.data == "adm_change_pin")
async def cb_admin_change_pin_start(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer(
        "Введіть новий 4-значний PIN-код для входу в адмінку:",
        reply_markup=admin_cancel_action_kb()
    )
    await state.set_state(AdminFSM.changing_pin)

@admin_router.message(AdminFSM.changing_pin)
async def process_change_pin(message: Message, state: FSMContext):
    new_pin = message.text.strip()
    if len(new_pin) < 4:
        await message.answer("PIN-код має містити щонайменше 4 символи:")
        return

    await set_setting("admin_pin", new_pin)
    await state.clear()
    await message.answer(f"✅ PIN-код змінено на <code>{new_pin}</code>!", parse_mode="HTML")
    await show_admin_panel(message)
