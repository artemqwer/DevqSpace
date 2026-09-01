import { getSession } from "@/lib/session";
import {
  getAllReviews,
  updateReview,
  deleteReview,
  type ReviewStatus,
} from "@/lib/store";

const STATUSES: ReviewStatus[] = ["pending", "published", "hidden"];

export async function GET() {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  return Response.json({ ok: true, reviews: await getAllReviews() });
}

export async function PATCH(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    id?: string;
    status?: unknown;
    reply?: unknown;
  } | null;
  if (!body?.id) return Response.json({ ok: false }, { status: 400 });

  const patch: Parameters<typeof updateReview>[1] = {};

  if (STATUSES.includes(body.status as ReviewStatus)) {
    patch.status = body.status as ReviewStatus;
  }
  if (typeof body.reply === "string") {
    const text = body.reply.trim().slice(0, 1000);
    // Порожня відповідь = прибрати її, а не зберегти порожній блок.
    patch.reply = text ? { text, at: Date.now() } : undefined;
  }

  if (!Object.keys(patch).length)
    return Response.json({ ok: false, error: "Немає змін" }, { status: 400 });

  const next = await updateReview(body.id, patch);
  if (!next) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: true, review: next });
}

export async function DELETE(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ ok: false }, { status: 400 });

  await deleteReview(id);
  return Response.json({ ok: true });
}
