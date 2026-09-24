import { getSession } from "@/lib/session";
import {
  getAllTickets,
  getTicket,
} from "@/lib/support/store";
import {
  sendOperatorReply,
  unfreezeAI,
  closeTicket,
} from "@/lib/support/service";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await getAllTickets(100);
  return Response.json({ ok: true, tickets });
}

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ticketId, text } = body;
    if (!ticketId || !text || !text.trim()) {
      return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const updated = await sendOperatorReply(ticketId, text.trim());
    if (!updated) {
      return Response.json({ ok: false, error: "Ticket not found" }, { status: 404 });
    }

    return Response.json({ ok: true, ticket: updated });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ticketId, action } = body;

    if (!ticketId || !action) {
      return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    let updated = null;
    if (action === "unfreeze") {
      updated = await unfreezeAI(ticketId);
    } else if (action === "close") {
      updated = await closeTicket(ticketId);
    } else {
      return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });
    }

    return Response.json({ ok: true, ticket: updated });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
