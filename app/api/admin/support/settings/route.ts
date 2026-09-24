import { getSession } from "@/lib/session";
import { getSupportSettings, saveSupportSettings } from "@/lib/support/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const s = await getSupportSettings();
  const maskedKey = s.apiKey
    ? s.apiKey.length > 8
      ? `${s.apiKey.slice(0, 3)}••••••••${s.apiKey.slice(-4)}`
      : "••••••••"
    : "";

  return Response.json({
    ok: true,
    settings: {
      ...s,
      apiKey: maskedKey,
      hasApiKey: Boolean(s.apiKey && s.apiKey.trim().length > 0),
    },
  });
}

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const current = await getSupportSettings();

    // If apiKey contains bullets (••••), do not overwrite it with the masked string
    let newApiKey = current.apiKey;
    if (typeof body.apiKey === "string") {
      const trimmed = body.apiKey.trim();
      if (trimmed && !trimmed.includes("••••")) {
        newApiKey = trimmed;
      }
    }

    const saved = await saveSupportSettings({
      aiEnabled: Boolean(body.aiEnabled),
      apiKey: newApiKey,
      baseUrl: body.baseUrl?.trim() || "https://api.openai.com/v1",
      model: body.model?.trim() || "gpt-4o-mini",
      companyName: body.companyName?.trim() || "DevqSpace",
      welcomeMessage: body.welcomeMessage?.trim() || current.welcomeMessage,
      systemPrompt: body.systemPrompt?.trim() || current.systemPrompt,
      maxFailedVerifications: Number(body.maxFailedVerifications) || 3,
      lockoutMinutes: Number(body.lockoutMinutes) || 15,
    });

    return Response.json({
      ok: true,
      settings: {
        ...saved,
        apiKey: saved.apiKey
          ? `${saved.apiKey.slice(0, 3)}••••••••${saved.apiKey.slice(-4)}`
          : "",
        hasApiKey: Boolean(saved.apiKey),
      },
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
