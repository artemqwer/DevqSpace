import { getSession } from "@/lib/session";
import { blobEnabled, putObject } from "@/lib/blob";

// kind: "image" — картинка товару
//       "file"  — готовий ZIP, який видається клієнту як є
//       "template" — чистий шаблон проєкту, з якого збирається персональний ZIP

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!blobEnabled()) {
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
  const kind = String(form?.get("kind") ?? "image");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "Немає файлу" }, { status: 400 });
  }

  const isArchive = kind === "file" || kind === "template";
  const maxBytes = isArchive ? 200 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return Response.json(
      { ok: false, error: `Макс. розмір ${isArchive ? "200 МБ" : "5 МБ"}` },
      { status: 400 },
    );
  }
  if (!isArchive && !file.type.startsWith("image/")) {
    return Response.json(
      { ok: false, error: "Тільки зображення" },
      { status: 400 },
    );
  }

  try {
    const ext =
      file.name.split(".").pop()?.toLowerCase() || (isArchive ? "zip" : "png");
    // Непередбачуваний шлях (додатковий захист файлу-товару).
    const rnd = Math.random().toString(36).slice(2, 10);
    const path =
      kind === "template"
        ? `templates/${Date.now()}-${rnd}.${ext}`
        : kind === "file"
          ? `files/${Date.now()}-${rnd}.${ext}`
          : `products/${Date.now()}.${ext}`;
    const blob = await putObject(
      path,
      file,
      file.type || "application/octet-stream",
    );
    return Response.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      name: file.name,
    });
  } catch (e) {
    console.error("[upload] blob error:", e);
    return Response.json(
      { ok: false, error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}
