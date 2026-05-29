# Деплой на Vercel + Telegram бот

Все працює як один Next.js проект — сайт, API замовлень і Telegram-бот через webhook. Жодних окремих процесів запускати не треба.

## 1. Створіть Telegram бота

1. Напишіть [@BotFather](https://t.me/BotFather) у Telegram
2. Команда `/newbot` → виберіть ім'я та username
3. Скопіюйте `BOT_TOKEN` — він виглядає як `1234567890:AAH...`

## 2. Згенеруйте секрети

У терміналі (або онлайн-генератор):

```bash
# WEBHOOK_SECRET (32+ символи)
openssl rand -hex 32

# SETUP_KEY (16 символів)
openssl rand -hex 16
```

Якщо немає `openssl` — згенеруйте 2 випадкові рядки самостійно (літери + цифри).

## 3. Запуште на GitHub

```bash
cd nexus-marketplace
git add .
git commit -m "initial"
git remote add origin <your-repo>
git push -u origin main
```

## 4. Імпортуйте проект на Vercel

1. [vercel.com/new](https://vercel.com/new) → виберіть ваш репозиторій
2. Vercel сам розпізнає Next.js — нічого міняти не треба
3. **Environment Variables** — додайте 4 змінні:

| Назва                        | Значення                                       |
|------------------------------|------------------------------------------------|
| `TELEGRAM_BOT_TOKEN`         | Токен з @BotFather                             |
| `TELEGRAM_ADMIN_CHAT_ID`     | Поки залиште порожнім — заповните в кроці 6    |
| `TELEGRAM_WEBHOOK_SECRET`    | Перший згенерований рядок                      |
| `TELEGRAM_SETUP_KEY`         | Другий згенерований рядок                      |

4. **Deploy**. Через хвилину отримаєте URL типу `https://nexus-marketplace.vercel.app`.

## 5. Активуйте webhook

Відкрийте у браузері (або curl):

```
https://<your-domain>.vercel.app/api/tg-webhook/setup?key=<TELEGRAM_SETUP_KEY>
```

Очікувана відповідь:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set",
  "webhookUrl": "https://<your-domain>.vercel.app/api/tg-webhook"
}
```

Тепер Telegram автоматично слатиме всі повідомлення вашому боту на цей URL.

## 6. Дізнайтеся свій chat_id

1. Відкрийте свого бота в Telegram (`https://t.me/<username>`)
2. Напишіть `/where`
3. Бот відповість: `chat_id: 123456789`
4. Поверніться у Vercel → **Settings → Environment Variables** → відредагуйте `TELEGRAM_ADMIN_CHAT_ID` → вставте цей `chat_id`
5. У вкладці **Deployments** натисніть **Redeploy** на останньому
6. Готово — після рестарту бот відповідає на `/start`, `/help`, `/ping` і ловить замовлення

## Як перевірити

- Зайдіть на `https://<your-domain>.vercel.app/catalog`
- Виберіть товар → **Замовити** → заповніть форму → **Надіслати**
- Через 1-2 секунди ви маєте отримати повідомлення в Telegram

## Корисні endpoints

| URL                                                                | Що робить                            |
|--------------------------------------------------------------------|--------------------------------------|
| `/api/tg-webhook/setup?key=<KEY>`                                  | Активувати webhook                   |
| `/api/tg-webhook/setup?key=<KEY>&action=info`                      | Подивитись поточний стан webhook     |
| `/api/tg-webhook/setup?key=<KEY>&action=delete`                    | Скинути webhook                      |

## Що в чаті бачите

```
🛒 Нове замовлення продукту

📦 Товар: Telegram Shop з CryptoPay
💵 Ціна: $45
🔗 tg-shop-cryptopay

👤 Клієнт
Ім'я: Артем
Telegram: @username

📝 ТЗ / Деталі
Хочу додати інтеграцію зі Stripe замість CryptoBot

30.05.2026, 16:42
```

Для кастомних замовлень — той самий формат, але з типом проекту, бюджетом і дедлайном.

## Якщо щось не так

- **`/where` не відповідає** → webhook не активований. Перевірте `?action=info`. У `last_error_message` побачите причину
- **Бот не пише в Telegram після форми** → перевірте що `TELEGRAM_ADMIN_CHAT_ID` точно дорівнює тому що повернув `/where`
- **`401 Invalid setup key`** → переплутали URL-параметр `?key=...` з ENV `TELEGRAM_SETUP_KEY`
- **Webhook працює локально не треба** → `next dev` не доступний Telegram-у з-зовні. Для локальних експериментів використовуйте [ngrok](https://ngrok.com) або просто тестуйте в Vercel preview-деплої

## Python-варіант (опційно, для self-hosted VPS)

У теці `bot/` лежить `admin_bot.py` — той самий бот, але через long polling для запуску на власному сервері. Для Vercel він не потрібен.
