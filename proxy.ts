import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Назва cookie дублюється тут навмисно: proxy працює в edge-рантаймі,
// тож не імпортуємо lib/session (воно тягне next/headers).
const ADMIN_COOKIE = "nexus_admin";

// Optimistic guard: якщо немає cookie сесії — редірект на логін.
// Повна перевірка підпису токена відбувається в layout адмінки на сервері.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLogin = pathname === "/admin/login";
  const hasCookie = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);

  if (!isLogin && !hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Уже залогінений і йде на /admin/login → у дашборд
  if (isLogin && hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
