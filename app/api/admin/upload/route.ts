import { put } from "@vercel/blob";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        ok: false,
        error:
          "Blob не налаштовано. Підключіть Vercel Blob у Storage, або вставте URL картинки вручну.",
      },
      { status: 501 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "Немає файлу" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json(
      { ok: false, error: "Макс. розмір 5 МБ" },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return Response.json(
      { ok: false, error: "Тільки зображення" },
      { status: 400 },
    );
  }

  try {
    const ext = file.name.split(".").pop() || "png";
    const blob = await put(`products/${Date.now()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
    });
    return Response.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("[upload] blob error:", e);
    return Response.json(
      { ok: false, error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}
