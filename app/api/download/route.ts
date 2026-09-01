import { getOrderByToken, getProductBySlug } from "@/lib/store";

// Захищене завантаження товару за токеном: /api/download?t=<token>
// Токен видається лише після підтвердження оплати (lib/delivery). Перевіряємо,
// що замовлення оплачене, і редіректимо на файл у Blob.

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t");
  if (!token) {
    return new Response("Некоректне посилання", { status: 400 });
  }

  const order = await getOrderByToken(token);
  if (!order) {
    return new Response("Посилання недійсне або застаріле", { status: 404 });
  }
  if (!order.paid) {
    return new Response("Оплату ще не підтверджено", { status: 403 });
  }
  if (order.type !== "product" || !order.productSlug) {
    return new Response("Файл недоступний", { status: 404 });
  }

  // Персональний архів (зібраний під .env клієнта) має пріоритет над
  // статичним файлом товару.
  if (order.packageUrl) {
    return Response.redirect(order.packageUrl, 302);
  }

  const product = await getProductBySlug(order.productSlug);
  const url = order.deliverFileUrl ?? product?.fileUrl;
  if (!url) {
    return new Response("Файл недоступний", { status: 404 });
  }

  return Response.redirect(url, 302);
}
