# DevqSpace Admin Bot

Простий Telegram-бот для адміна студії. Доповнює основний flow: замовлення з сайту приходять напряму через Bot API, цей скрипт додає інтерактивні команди.

## Швидкий старт

1. Створіть бота через [@BotFather](https://t.me/BotFather) → отримайте `BOT_TOKEN`
2. Напишіть йому `/start` у Telegram
3. Відкрийте `https://api.telegram.org/bot<TOKEN>/getUpdates` у браузері → знайдіть `chat.id`

```bash
cd bot
cp .env.example .env
# відредагуйте .env: BOT_TOKEN + ADMIN_CHAT_ID

python -m venv .venv
source .venv/bin/activate    # Linux / Mac
# .venv\Scripts\activate     # Windows

pip install -r requirements.txt
python admin_bot.py
```

Той самий `BOT_TOKEN` і `ADMIN_CHAT_ID` треба прописати в `.env` Next.js застосунку як `TELEGRAM_BOT_TOKEN` і `TELEGRAM_ADMIN_CHAT_ID` — тоді кожне замовлення з сайту автоматично летить вам у Telegram.

## Команди

| Команда   | Дія                                       |
|-----------|-------------------------------------------|
| `/start`  | Привітання                                |
| `/help`   | Список команд                             |
| `/ping`   | Перевірити що бот живий                   |
| `/where`  | Дізнатися свій `chat_id`                  |
| `/stats`  | Статистика сесії (аптайм + повідомлення)  |

## Деплой на VPS

```bash
# 1. systemd unit (/etc/systemd/system/nexus-bot.service)
[Unit]
Description=DevqSpace Admin Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/nexus-bot
ExecStart=/opt/nexus-bot/.venv/bin/python admin_bot.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now nexus-bot
sudo journalctl -u nexus-bot -f
```
