import { getSession } from "@/lib/session";
import {
  createDraft, getRelease, ReleaseError, resetDraftUpload, verifyAndPublish, withdrawRelease,
} from "@/lib/rescue-releases";

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ReleaseError("Некоректний запит.");
    }
    const input = body as Record<string, unknown>;
    if (input.action === "create") return Response.json(await createDraft(input), { status: 201 });
    const release = typeof input.id === "string" ? await getRelease(input.id) : null;
    if (!release) throw new ReleaseError("Випуск не знайдено.", 404);
    switch (input.action) {
      case "get": return Response.json(release);
      case "publish": return Response.json(await verifyAndPublish(release, request.signal));
      case "withdraw": return Response.json(await withdrawRelease(release, input.reason));
      case "reset-upload": return Response.json(await resetDraftUpload(release));
      default: throw new ReleaseError("Невідома дія.");
    }
  } catch (error) {
    if (error instanceof ReleaseError) return Response.json({ error: error.message }, { status: error.status });
    console.error("[shadxwrescue] release action failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Не вдалося завершити дію зі сховищем." }, { status: 502 });
  }
}
