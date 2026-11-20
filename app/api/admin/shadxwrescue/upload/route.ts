import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ISO_CONTENT_TYPE } from "@/lib/rescue-release-types";
import { getRelease, privateBlobToken, ReleaseError } from "@/lib/rescue-releases";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as HandleUploadBody | null;
    if (!body || (body.type !== "blob.generate-client-token" && body.type !== "blob.upload-completed")) {
      throw new ReleaseError("Некоректний запит на завантаження.");
    }

    const result = await handleUpload({
      body, request, token: privateBlobToken(),
      async onBeforeGenerateToken(pathname, releaseId, multipart) {
        if (!(await getSession())) throw new ReleaseError("Unauthorized", 401);
        const draft = releaseId ? await getRelease(releaseId) : null;
        if (!draft || draft.status !== "draft" || draft.pathname !== pathname || !multipart) {
          throw new ReleaseError("Шлях завантаження не відповідає чернетці.", 409);
        }
        return {
          allowedContentTypes: [ISO_CONTENT_TYPE],
          maximumSizeInBytes: draft.size,
          addRandomSuffix: false, allowOverwrite: false,
          validUntil: Date.now() + 60 * 60_000,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof ReleaseError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Не вдалося підготувати завантаження ISO." }, { status: 400 });
  }
}
