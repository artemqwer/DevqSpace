from typing import Dict, List, Optional, Any
from database.db import get_db

# ==================== SETTINGS ====================

async def get_all_settings() -> Dict[str, str]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT key, value FROM settings;")
        rows = await cursor.fetchall()
        return {r["key"]: r["value"] for r in rows}

async def get_setting(key: str, default: str = "") -> str:
    async with await get_db() as db:
        cursor = await db.execute("SELECT value FROM settings WHERE key = ?;", (key,))
        row = await cursor.fetchone()
        return row["value"] if row else default

async def set_setting(key: str, value: str):
    async with await get_db() as db:
        await db.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);", (key, str(value)))
        await db.commit()

# ==================== ADMINS ====================

async def is_admin(user_id: int) -> bool:
    async with await get_db() as db:
        cursor = await db.execute("SELECT user_id FROM admins WHERE user_id = ?;", (user_id,))
        if await cursor.fetchone():
            return True
        # Перевірка супер-адміна в settings
        cursor = await db.execute("SELECT value FROM settings WHERE key = 'super_admin_id';")
        row = await cursor.fetchone()
        if row and row["value"] == str(user_id):
            return True
    return False

async def add_admin(user_id: int, username: str = ""):
    async with await get_db() as db:
        await db.execute("INSERT OR IGNORE INTO admins (user_id, username) VALUES (?, ?);", (user_id, username))
        await db.commit()

async def list_admins() -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT * FROM admins ORDER BY added_at DESC;")
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def remove_admin(user_id: int):
    async with await get_db() as db:
        await db.execute("DELETE FROM admins WHERE user_id = ?;", (user_id,))
        await db.commit()

# ==================== SERVICES (PACKAGES) ====================

async def get_services(active_only: bool = True) -> List[Dict[str, Any]]:
    async with await get_db() as db:
        query = "SELECT * FROM services"
        if active_only:
            query += " WHERE is_active = 1"
        query += " ORDER BY order_idx ASC, id ASC;"
        cursor = await db.execute(query)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def get_service(service_id: int) -> Optional[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT * FROM services WHERE id = ?;", (service_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None

async def add_service(title: str, description: str, price: int, deposit: int, duration_min: int = 60) -> int:
    async with await get_db() as db:
        cursor = await db.execute("""
            INSERT INTO services (title, description, price, deposit, duration_min, is_active)
            VALUES (?, ?, ?, ?, ?, 1);
        """, (title, description, price, deposit, duration_min))
        await db.commit()
        return cursor.lastrowid

async def update_service(service_id: int, **fields):
    if not fields:
        return
    sets = ", ".join(f"{k} = ?" for k in fields.keys())
    values = list(fields.values()) + [service_id]
    async with await get_db() as db:
        await db.execute(f"UPDATE services SET {sets} WHERE id = ?;", values)
        await db.commit()

async def delete_service(service_id: int):
    async with await get_db() as db:
        await db.execute("DELETE FROM services WHERE id = ?;", (service_id,))
        await db.commit()

# ==================== PORTFOLIO ====================

async def get_portfolio_categories() -> List[str]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT DISTINCT category FROM portfolio ORDER BY category ASC;")
        rows = await cursor.fetchall()
        cats = [r["category"] for r in rows if r["category"]]
        # Якщо в базі поки немає фото, повернемо стандартні категорії
        if not cats:
            return ["Індивідуальна", "Love Story", "Весільна", "Студійна", "Контент"]
        return cats

async def get_portfolio_by_category(category: str) -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM portfolio WHERE category = ? ORDER BY order_idx ASC, id DESC;",
            (category,)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def add_portfolio_item(category: str, file_id: str, caption: str = "") -> int:
    async with await get_db() as db:
        cursor = await db.execute("""
            INSERT INTO portfolio (category, file_id, caption)
            VALUES (?, ?, ?);
        """, (category, file_id, caption))
        await db.commit()
        return cursor.lastrowid

async def delete_portfolio_item(item_id: int):
    async with await get_db() as db:
        await db.execute("DELETE FROM portfolio WHERE id = ?;", (item_id,))
        await db.commit()

# ==================== BOOKINGS ====================

async def create_booking(
    user_id: int,
    user_name: str,
    user_contact: str,
    service_id: int,
    service_title: str,
    booking_date: str,
    booking_time: str,
    location: str = "",
    notes: str = ""
) -> int:
    async with await get_db() as db:
        cursor = await db.execute("""
            INSERT INTO bookings (
                user_id, user_name, user_contact, service_id, service_title,
                booking_date, booking_time, location, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING');
        """, (user_id, user_name, user_contact, service_id, service_title, booking_date, booking_time, location, notes))
        await db.commit()
        return cursor.lastrowid

async def get_booking(booking_id: int) -> Optional[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT * FROM bookings WHERE id = ?;", (booking_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None

async def update_booking_status(booking_id: int, status: str, deposit_paid: Optional[int] = None):
    async with await get_db() as db:
        if deposit_paid is not None:
            await db.execute(
                "UPDATE bookings SET status = ?, deposit_paid = ? WHERE id = ?;",
                (status, deposit_paid, booking_id)
            )
        else:
            await db.execute(
                "UPDATE bookings SET status = ? WHERE id = ?;",
                (status, booking_id)
            )
        await db.commit()

async def attach_receipt(booking_id: int, file_id: str):
    async with await get_db() as db:
        await db.execute("UPDATE bookings SET receipt_file_id = ? WHERE id = ?;", (file_id, booking_id))
        await db.commit()

async def get_recent_bookings(limit: int = 20) -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("""
            SELECT * FROM bookings ORDER BY id DESC LIMIT ?;
        """, (limit,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def get_bookings_by_date(date_str: str) -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("""
            SELECT * FROM bookings WHERE booking_date = ? AND status != 'CANCELLED';
        """, (date_str,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def get_upcoming_confirmed_bookings() -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("""
            SELECT * FROM bookings
            WHERE status IN ('CONFIRMED', 'PAID')
            ORDER BY booking_date ASC, booking_time ASC;
        """)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

# ==================== CLIENTS ====================

async def record_client(user_id: int, first_name: str = "", username: str = "", phone: str = ""):
    async with await get_db() as db:
        await db.execute("""
            INSERT INTO clients (user_id, first_name, username, phone, last_seen)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                first_name = excluded.first_name,
                username = excluded.username,
                phone = COALESCE(NULLIF(excluded.phone, ''), clients.phone),
                last_seen = CURRENT_TIMESTAMP;
        """, (user_id, first_name, username, phone))
        await db.commit()

async def get_all_clients() -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT * FROM clients ORDER BY last_seen DESC;")
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

# ==================== BLOCKED SLOTS / DAYS OFF ====================

async def block_slot(date_str: str, time_str: str = "", reason: str = "") -> int:
    async with await get_db() as db:
        cursor = await db.execute("""
            INSERT INTO blocked_slots (date_str, time_str, reason)
            VALUES (?, ?, ?);
        """, (date_str, time_str, reason))
        await db.commit()
        return cursor.lastrowid

async def unblock_slot(slot_id: int):
    async with await get_db() as db:
        await db.execute("DELETE FROM blocked_slots WHERE id = ?;", (slot_id,))
        await db.commit()

async def get_blocked_slots(date_str: str) -> List[Dict[str, Any]]:
    async with await get_db() as db:
        cursor = await db.execute("SELECT * FROM blocked_slots WHERE date_str = ?;", (date_str,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]
