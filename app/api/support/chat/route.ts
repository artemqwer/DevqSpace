import { NextResponse } from "next/server";
import { handleUserMessage } from "@/lib/support/service";
import { getTicketBySession, getSupportSettings } from "@/lib/support/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 });
    }

    const ticket = await getTicketBySession(sessionId);
    return NextResponse.json(
      {
        ok: true,
        ticket: ticket
          ? {
              id: ticket.id,
              status: ticket.status,
              messages: ticket.messages,
              isFrozen:
                ticket.status === "waiting_operator" ||
                ticket.status === "operator_active",
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, message, contact, name } = body;

    if (!sessionId || !message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const existingTicket = await getTicketBySession(sessionId);
    const isOperatorSession =
      existingTicket &&
      (existingTicket.status === "waiting_operator" ||
        existingTicket.status === "operator_active");

    const settings = await getSupportSettings();
    if (!isOperatorSession && (!settings.aiEnabled || !settings.apiKey)) {
      return NextResponse.json(
        { ok: false, error: "Підтримка тимчасово недоступна. Будь ласка, спробуйте пізніше." },
        { status: 503 },
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await handleUserMessage(sessionId, message, {
      ip,
      userAgent,
      contact,
      name,
    });

    return NextResponse.json(
      {
        ok: true,
        reply: result.reply,
        sender: result.sender,
        isFrozen: result.isFrozen,
        status: result.ticket.status,
        messages: result.ticket.messages,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (e: any) {
    console.error("[api/support/chat] error:", e);
    return NextResponse.json(
      { ok: false, error: e.message || "Internal server error" },
      { status: 500 },
    );
  }
}
