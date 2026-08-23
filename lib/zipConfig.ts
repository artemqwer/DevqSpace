import "server-only";
import AdmZip from "adm-zip";
import { put } from "@vercel/blob";

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Завантажує базовий ZIP, підставляє значення в .env / .env.example усередині,
// заливає персональний архів у Blob і повертає його URL. null — якщо нема що
// підставляти або щось пішло не так (тоді видаємо оригінал).
export async function buildCustomZip(opts: {
  fileUrl: string;
  envFields: { key: string; label: string }[];
  envValues: Record<string, string>;
  orderId: string;
}): Promise<string | null> {
  const provided = opts.envFields.filter((f) =>
    opts.envValues[f.key]?.trim(),
  );
  if (!provided.length || !process.env.BLOB_READ_WRITE_TOKEN) return null;

  const setLine = (content: string, key: string, val: string) => {
    const re = new RegExp(`^${esc(key)}\\s*=.*$`, "m");
    if (re.test(content)) return content.replace(re, `${key}=${val}`);
    return content + (content.endsWith("\n") ? "" : "\n") + `${key}=${val}\n`;
  };

  try {
    const res = await fetch(opts.fileUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const zip = new AdmZip(Buffer.from(await res.arrayBuffer()));

    let patched = false;
    for (const entry of zip.getEntries()) {
      if (entry.isDirectory) continue;
      const base = entry.entryName.split("/").pop() || "";
      if (base !== ".env" && base !== ".env.example") continue;

      let content = entry.getData().toString("utf8");
      for (const f of provided) content = setLine(content, f.key, opts.envValues[f.key].trim());
      zip.updateFile(entry.entryName, Buffer.from(content, "utf8"));
      patched = true;

      // .env.example без сусіднього .env → створюємо готовий .env
      if (base === ".env.example") {
        const dir = entry.entryName.slice(0, entry.entryName.length - base.length);
        const envName = dir + ".env";
        if (!zip.getEntry(envName)) zip.addFile(envName, Buffer.from(content, "utf8"));
      }
    }

    // .env взагалі не знайдено — кладемо новий у корінь
    if (!patched) {
      const content = provided
        .map((f) => `${f.key}=${opts.envValues[f.key].trim()}`)
        .join("\n") + "\n";
      zip.addFile(".env", Buffer.from(content, "utf8"));
    }

    const blob = await put(
      `delivered/${opts.orderId}-${Date.now()}.zip`,
      zip.toBuffer(),
      { access: "public", contentType: "application/zip" },
    );
    return blob.url;
  } catch (e) {
    console.error("[zip] customize error:", e);
    return null;
  }
}
