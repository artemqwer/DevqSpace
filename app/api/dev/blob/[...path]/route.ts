import { devRouteBlocked } from "@/lib/devStubs";
import { devReadFile } from "@/lib/devStorage";

// Віддає файли локального dev-сховища замість Vercel Blob.
// У проді роут мертвий.

const TYPES: Record<string, string> = {
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  if (devRouteBlocked()) return new Response(null, { status: 404 });

  const { path } = await ctx.params;
  const rel = path.join("/");
  const bytes = devReadFile("blob", rel);
  if (!bytes) return new Response("Not found", { status: 404 });

  const ext = rel.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext] ?? "application/octet-stream";
  const name = rel.split("/").pop() ?? "file";

  return new Response(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "no-store",
      ...(type === "application/octet-stream" || type === "application/zip"
        ? { "Content-Disposition": `attachment; filename="${name}"` }
        : {}),
    },
  });
}
