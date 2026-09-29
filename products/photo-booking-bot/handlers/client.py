import logging
from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery, ContentType
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from database.models import (
    record_client, get_setting, get_services, get_service,
    get_portfolio_categories, get_portfolio_by_category,
    create_booking, get_booking, attach_receipt, list_admins, is_admin
)
from keyboards.client_kb import (
    main_menu_kb, cancel_kb, portfolio_categories_kb,
    services_list_kb, dates_kb, time_slots_kb, payment_action_kb
)
from services.calendar_service import get_available_slots

logger = logging.getLogger(__name__)
client_router = Router()

class BookingFSM(StatesGroup):
    choosing_service = State()
    choosing_date = State()
    choosing_time = State()
    entering_name = State()
    entering_contact = State()
    entering_location = State()

class ReceiptFSM(StatesGroup):
    waiting_receipt = State()

# ==================== START & MENU ====================

@client_router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    user = message.from_user
    if not user:
        return

    # Зберігаємо клієнта в БД
    await record_client(
        user_id=user.id,
        first_name=user.first_name or "",
        username=user.username or ""
    )

    # Перевірка deep-link для швидкого входу в адмінку (напр. /start pin_7788)
    args = message.text.split(maxsplit=1)
    if len(args) > 1:
        param = args[1].strip()
        admin_pin = await get_setting("admin_pin", "7788")
        if param in (f"pin_{admin_pin}", f"admin_{admin_pin}"):
            from database.models import add_admin
            await add_admin(user.id, user.username or user.first_name)
            await message.answer(
                "👑 <b>Ви успішно авторизовані як адміністратор!</b>\nВведіть /admin для перегляду панелі керування.",
                parse_mode="HTML"
            )

    welcome_text = await get_setting("welcome_text")
    if not welcome_text:
        welcome_text = "📸 <b>Ласкаво просимо!</b>\nОберіть потрібний розділ меню нижче 👇"

    await message.answer(welcome_text, reply_markup=main_menu_kb(), parse_mode="HTML")

@client_router.message(F.text == "❌ Скасувати")
async def cmd_cancel(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("Дію скасовано. Головне меню 👇", reply_markup=main_menu_kb())

# ==================== MAIN SECTIONS ====================

@client_router.message(F.text == "💰 Пакети та ціни")
async def show_services(message: Message):
    services = await get_services(active_only=True)
    if not services:
        await message.answer("Наразі пакети послуг оновлюються фотографом. Спробуйте пізніше або напишіть в Контакти.")
        return

    text = "✨ <b>Актуальні пакети фотосесій та ціни</b>:\n\n"
    for s in services:
        curr = s.get("currency", "грн")
        text += (
            f"• <b>{s['title']}</b> — <b>{s['price']} {curr}</b>\n"
            f"  ⏱ Тривалість: {s.get('duration_min', 60)} хв\n"
            f"  💳 Завдаток: {s.get('deposit', 500)} {curr}\n"
            f"  📝 {s['description']}\n\n"
        )
    text += "Оберіть пакет нижче, щоб перейти до вибору дати 👇"
    await message.answer(text, reply_markup=services_list_kb(services), parse_mode="HTML")

@client_router.message(F.text == "🖼 Портфоліо")
async def show_portfolio(message: Message):
    categories = await get_portfolio_categories()
    text = (
        "🖼 <b>Портфоліо робіт</b>\n\n"
        "Оберіть напрямок, щоб переглянути серію знімків та образи:"
    )
    await message.answer(text, reply_markup=portfolio_categories_kb(categories), parse_mode="HTML")

@client_router.callback_query(F.data.startswith("port_cat:"))
async def view_portfolio_category(callback: CallbackQuery):
    cat = callback.data.split(":", 1)[1]
    items = await get_portfolio_by_category(cat)

    if not items:
        await callback.answer(f"У категорії «{cat}» поки немає завантажених фото.", show_alert=True)
        return

    await callback.answer()
    await callback.message.answer(f"📷 <b>Категорія: {cat}</b>\nПоказуємо вибрані кадри:", parse_mode="HTML")

    for item in items[:6]: # надсилаємо до 6 фото
        try:
            if item.get("file_id"):
                await callback.message.answer_photo(
                    photo=item["file_id"],
                    caption=item.get("caption") or f"Фотосесія «{cat}»"
                )
        except Exception as e:
            logger.warning(f"Error sending photo {item['id']}: {e}")

    await callback.message.answer(
        f"Сподобалися кадри в стилі «{cat}»? Можемо організувати для вас таку ж зйомку!",
        reply_markup=main_menu_kb()
    )

@client_router.message(F.text == "📍 Локації")
async def show_locations(message: Message):
    locations_text = await get_setting("locations_text")
    await message.answer(locations_text, parse_mode="HTML")

@client_router.message(F.text == "📄 Гайд підготовки")
async def show_prep_guide(message: Message):
    guide_text = await get_setting("prep_guide_text")
    await message.answer(guide_text, parse_mode="HTML")

@client_router.message(F.text == "📞 Контакти")
async def show_contacts(message: Message):
    name = await get_setting("photographer_name", "Фотограф")
    studio = await get_setting("studio_name", "")
    tg = await get_setting("contact_telegram", "")
    inst = await get_setting("contact_instagram", "")
    phone = await get_setting("contact_phone", "")
    web = await get_setting("contact_website", "")

    text = f"📞 <b>Контакти {name}</b>"
    if studio:
        text += f" ({studio})"
    text += ":\n\n"

    if tg:
        text += f"• Telegram: <b>{tg}</b>\n"
    if inst:
        text += f"• Instagram: <b>{inst}</b>\n"
    if phone:
        text += f"• Телефон: <b>{phone}</b>\n"
    if web:
        text += f"• Сайт: <b>{web}</b>\n"

    text += "\nЗалишилися питання? Напишіть фотографу прямо зараз або забронюйте зйомку онлайн!"
    await message.answer(text, parse_mode="HTML")

# ==================== BOOKING FLOW ====================

@client_router.message(F.text == "📅 Записатися на зйомку")
@client_router.callback_query(F.data == "start_booking")
async def start_booking(event: Message | CallbackQuery, state: FSMContext):
    await state.clear()
    services = await get_services(active_only=True)
    if not services:
        msg = "Наразі запис тимчасово призупинено. Зв'яжіться з фотографом у розділі Контакти."
        if isinstance(event, CallbackQuery):
            await event.answer(msg, show_alert=True)
        else:
            await event.answer(msg)
        return

    text = "📅 <b>Онлайн-запис на зйомку</b>\nКрок 1/5: Оберіть бажаний пакет послуг 👇"
    if isinstance(event, CallbackQuery):
        await event.answer()
        await event.message.answer(text, reply_markup=services_list_kb(services), parse_mode="HTML")
    else:
        await event.answer(text, reply_markup=services_list_kb(services), parse_mode="HTML")

    await state.set_state(BookingFSM.choosing_service)

@client_router.callback_query(F.data.startswith("book_service:"))
async def booking_pick_service(callback: CallbackQuery, state: FSMContext):
    service_id = int(callback.data.split(":", 1)[1])
    service = await get_service(service_id)
    if not service:
        await callback.answer("Послугу не знайдено", show_alert=True)
        return

    await state.update_data(
        service_id=service["id"],
        service_title=service["title"],
        service_price=service["price"],
        service_deposit=service.get("deposit", 500)
    )

    await callback.answer()
    await callback.message.answer(
        f"✅ Обрано: <b>{service['title']}</b> ({service['price']} грн)\n\n"
        "Крок 2/5: Оберіть зручну дату для фотосесії 👇",
        reply_markup=dates_kb(14),
        parse_mode="HTML"
    )
    await state.set_state(BookingFSM.choosing_date)

@client_router.callback_query(F.data == "back_to_services")
async def booking_back_to_services(callback: CallbackQuery, state: FSMContext):
    services = await get_services(active_only=True)
    await callback.answer()
    await callback.message.edit_text(
        "Крок 1/5: Оберіть бажаний пакет послуг 👇",
        reply_markup=services_list_kb(services),
        parse_mode="HTML"
    )
    await state.set_state(BookingFSM.choosing_service)

@client_router.callback_query(F.data == "reselect_date")
async def booking_reselect_date(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.edit_text(
        "Крок 2/5: Оберіть дату для фотосесії 👇",
        reply_markup=dates_kb(14),
        parse_mode="HTML"
    )
    await state.set_state(BookingFSM.choosing_date)

@client_router.callback_query(F.data.startswith("book_date:"))
async def booking_pick_date(callback: CallbackQuery, state: FSMContext):
    date_str = callback.data.split(":", 1)[1]
    available_slots = await get_available_slots(date_str)

    if not available_slots:
        await callback.answer(f"На жаль, на {date_str} всі слоти вже зайняті або це вихідний. Оберіть інший день.", show_alert=True)
        return

    await state.update_data(booking_date=date_str)
    await callback.answer()
    await callback.message.edit_text(
        f"📅 Обрана дата: <b>{date_str}</b>\n\n"
        "Крок 3/5: Оберіть вільний час у календарі 👇",
        reply_markup=time_slots_kb(available_slots, date_str),
        parse_mode="HTML"
    )
    await state.set_state(BookingFSM.choosing_time)

@client_router.callback_query(F.data.startswith("book_time:"))
async def booking_pick_time(callback: CallbackQuery, state: FSMContext):
    parts = callback.data.split(":")
    date_str = parts[1]
    time_str = parts[2]

    await state.update_data(booking_date=date_str, booking_time=time_str)
    await callback.answer()

    await callback.message.answer(
        f"⏰ Обрано час: <b>{date_str} о {time_str}</b>\n\n"
        "Крок 4/5: Як до вас звертатися? Введіть ваше <b>Ім'я та Прізвище</b>:",
        reply_markup=cancel_kb(),
        parse_mode="HTML"
    )
    await state.set_state(BookingFSM.entering_name)

@client_router.message(BookingFSM.entering_name)
async def booking_enter_name(message: Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 2:
        await message.answer("Будь ласка, вкажіть реальне ім'я:")
        return

    await state.update_data(user_name=name)
    user = message.from_user
    suggested_contact = f"@{user.username}" if user and user.username else ""

    text = "Крок 5/5: Вкажіть ваш контакт для зв'язку (номер телефону або Telegram):"
    if suggested_contact:
        text += f"\n<i>(Наприклад: {suggested_contact} або +380...)</i>"

    await message.answer(text, parse_mode="HTML")
    await state.set_state(BookingFSM.entering_contact)

@client_router.message(BookingFSM.entering_contact)
async def booking_enter_contact(message: Message, state: FSMContext):
    contact = message.text.strip()
    if len(contact) < 3:
        await message.answer("Будь ласка, вкажіть коректний контакт:")
        return

    await state.update_data(user_contact=contact)
    await message.answer(
        "Бажана локація чи особливі побажання до зйомки?\n"
        "<i>(Якщо ще не визначилися — напишіть «порадитися з фотографом»)</i>",
        parse_mode="HTML"
    )
    await state.set_state(BookingFSM.entering_location)

@client_router.message(BookingFSM.entering_location)
async def booking_finish(message: Message, state: FSMContext, bot: Bot):
    notes = message.text.strip()
    data = await state.get_data()
    await state.clear()

    user = message.from_user
    user_id = user.id if user else 0

    # 1. Зберігаємо бронювання в БД
    booking_id = await create_booking(
        user_id=user_id,
        user_name=data.get("user_name", "Клієнт"),
        user_contact=data.get("user_contact", ""),
        service_id=data.get("service_id", 0),
        service_title=data.get("service_title", "Фотосесія"),
        booking_date=data.get("booking_date", ""),
        booking_time=data.get("booking_time", ""),
        location=notes,
        notes=notes
    )

    deposit_enabled = (await get_setting("deposit_enabled", "true")) == "true"
    deposit_amount = data.get("service_deposit", 500)
    card_number = await get_setting("card_number")
    jar_url = await get_setting("monobank_jar_url")

    # 2. Формуємо відповідь клієнту
    client_text = (
        f"🎉 <b>Заявку #{booking_id} успішно створено!</b>\n\n"
        f"📸 <b>Послуга</b>: {data.get('service_title')}\n"
        f"📅 <b>Дата та час</b>: {data.get('booking_date')} о {data.get('booking_time')}\n"
        f"👤 <b>Клієнт</b>: {data.get('user_name')} ({data.get('user_contact')})\n"
        f"📍 <b>Побажання / локація</b>: {notes}\n"
        f"💵 <b>Вартість</b>: {data.get('service_price')} грн\n\n"
    )

    if deposit_enabled:
        client_text += (
            f"💳 <b>Для фіксації слота в календарі внесіть завдаток</b>: <b>{deposit_amount} грн</b>.\n"
            f"Реквізити для оплати:\n"
            f"• <b>Картка</b>: <code>{card_number}</code>\n"
        )
        if jar_url:
            client_text += f"• <b>Банка Monobank</b>: {jar_url}\n"
        client_text += (
            "\nПісля оплати натисніть кнопку нижче або надішліть скріншот квитанції у цей чат 👇"
        )
        reply_kb = payment_action_kb(booking_id, jar_url, deposit_amount)
    else:
        client_text += "Фотограф зв'яжеться з вами найближчим часом для підтвердження деталей."
        reply_kb = main_menu_kb()

    await message.answer(client_text, reply_markup=reply_kb, parse_mode="HTML")

    # 3. Сповіщення фотографу / адміністраторам
    admin_notify = (
        f"🔔 <b>НОВИЙ ЗАПИС НА ЗЙОМКУ #{booking_id}!</b>\n\n"
        f"📸 <b>Пакет</b>: {data.get('service_title')} ({data.get('service_price')} грн)\n"
        f"📅 <b>Дата</b>: {data.get('booking_date')} о {data.get('booking_time')}\n"
        f"👤 <b>Клієнт</b>: {data.get('user_name')}\n"
        f"📞 <b>Контакт</b>: {data.get('user_contact')}\n"
        f"📍 <b>Локація/нотатки</b>: {notes}\n"
        f"💳 <b>Завдаток</b>: {deposit_amount} грн (очікується)\n\n"
        f"Введіть /admin для перегляду та підтвердження запису."
    )

    admins = await list_admins()
    for adm in admins:
        try:
            await bot.send_message(adm["user_id"], admin_notify, parse_mode="HTML")
        except Exception as e:
            logger.warning(f"Failed to notify admin {adm['user_id']}: {e}")

# ==================== RECEIPT UPLOAD ====================

@client_router.callback_query(F.data.startswith("upload_receipt:"))
async def ask_receipt(callback: CallbackQuery, state: FSMContext):
    booking_id = int(callback.data.split(":", 1)[1])
    await state.update_data(receipt_booking_id=booking_id)
    await callback.answer()
    await callback.message.answer(
        f"📤 Надішліть, будь ласка, <b>скріншот або фото квитанції</b> про оплату завдатку для замовлення #{booking_id}:",
        reply_markup=cancel_kb(),
        parse_mode="HTML"
    )
    await state.set_state(ReceiptFSM.waiting_receipt)

@client_router.message(ReceiptFSM.waiting_receipt, F.photo)
async def process_receipt_photo(message: Message, state: FSMContext, bot: Bot):
    data = await state.get_data()
    booking_id = data.get("receipt_booking_id", 0)
    await state.clear()

    photo_id = message.photo[-1].file_id
    await attach_receipt(booking_id, photo_id)

    await message.answer(
        "✅ <b>Квитанцію отримано!</b>\n"
        "Фотограф перевірить зарахування та підтвердить ваш запис. Дякуємо!",
        reply_markup=main_menu_kb(),
        parse_mode="HTML"
    )

    # Сповіщення адміну з фото
    admins = await list_admins()
    for adm in admins:
        try:
            await bot.send_photo(
                adm["user_id"],
                photo=photo_id,
                caption=f"💳 <b>Отримано чек про оплату завдатку до запису #{booking_id}!</b>\nКлієнт: {message.from_user.first_name}",
                parse_mode="HTML"
            )
        except Exception as e:
            logger.warning(f"Error forwarding receipt to admin: {e}")
