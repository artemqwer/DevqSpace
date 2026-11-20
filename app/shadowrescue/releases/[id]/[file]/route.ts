import { getRelease, resolveIsoDownload } from "@/lib/rescue-releases";
import { isoName } from "@/lib/rescue-release-types";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(_request: Request, context: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await context.params;
  if (file !== "iso" && file !== "sha256") return new Response(null, { status: 404, headers: NO_STORE });
  try {
    const release = await getRelease(id);
    if (!release || release.status === "draft") return new Response(null, { status: 404, headers: NO_STORE });
    if (release.status === "withdrawn") return new Response("Этот образ отозван.", { status: 410, headers: NO_STORE });
    const name = isoName(release);
    if (file === "sha256") {
      return new Response(release.sha256 + "  " + name + "\n", {
        headers: {
          ...NO_STORE, "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": 'attachment; filename="' + name + '.sha256"',
        },
      });
    }
    return new Response(null, {
      status: 307, headers: { ...NO_STORE, Location: await resolveIsoDownload(release), "Referrer-Policy": "no-referrer" },
    });
  } catch {
    return new Response("Хранилище образов временно недоступно.", { status: 503, headers: NO_STORE });
  }
}
