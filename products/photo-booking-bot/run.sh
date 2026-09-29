#!/bin/bash
set -e

# Перевірка віртуального оточення
if [ ! -d "venv" ]; then
    echo "📦 Створення віртуального оточення venv..."
    python3 -m venv venv
fi

echo "🔄 Встановлення залежностей..."
./venv/bin/pip install -q -r requirements.txt

# Перевірка наявності .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️ Файл .env не знайдено. Створюємо з .env.example..."
        cp .env.example .env
        echo "❗ Будь ласка, вкажіть ваш BOT_TOKEN у файлі .env та запустіть скрипт знову!"
        exit 1
    fi
fi

echo "🚀 Запуск PhotoBooking Bot..."
exec ./venv/bin/python bot.py
