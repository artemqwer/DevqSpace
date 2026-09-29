import os
from aiohttp import web
from jinja2 import Environment, FileSystemLoader
from database.models import (
    get_all_settings, set_setting, get_services,
    get_recent_bookings, get_all_clients
)
from config import BASE_DIR, WEB_PORT

template_dir = BASE_DIR / "web" / "templates"
env = Environment(loader=FileSystemLoader(str(template_dir)))

async def dashboard_handler(request: web.Request):
    settings = await get_all_settings()
    services = await get_services(active_only=False)
    bookings = await get_recent_bookings(20)
    clients = await get_all_clients()

    template = env.get_template("dashboard.html")
    html = template.render(
        settings=settings,
        services=services,
        bookings=bookings,
        clients_count=len(clients),
        message=request.query.get("msg", "")
    )
    return web.Response(text=html, content_type="text/html")

async def save_settings_handler(request: web.Request):
    data = await request.post()
    allowed_keys = [
        "photographer_name", "contact_telegram", "contact_instagram",
        "card_number", "monobank_jar_url", "default_deposit_amount"
    ]
    for key in allowed_keys:
        if key in data:
            await set_setting(key, str(data[key]).strip())

    return web.HTTPFound("/?msg=Налаштування+успішно+збережено!")

def create_web_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/", dashboard_handler)
    app.router.add_post("/save-settings", save_settings_handler)
    return app
