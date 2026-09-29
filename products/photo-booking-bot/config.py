import os
from pathlib import Path
from dotenv import load_dotenv

# Завантаження .env якщо файл існує
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR = DATA_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(BASE_DIR / ".env")

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
raw_admin_id = os.getenv("ADMIN_ID", "").strip()
ADMIN_ID = int(raw_admin_id) if raw_admin_id.isdigit() else 0
ADMIN_PIN = os.getenv("ADMIN_PIN", "7788").strip()
WEB_PORT = int(os.getenv("WEB_PORT", "8080"))

DB_PATH = DATA_DIR / "booking.db"
