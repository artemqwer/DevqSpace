import { NextResponse } from "next/server";
import { getSupportSettings } from "@/lib/support/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSupportSettings();
    const isConfigured = Boolean(settings.aiEnabled && settings.apiKey && settings.apiKey.trim().length > 0);

    return NextResponse.json({
      enabled: isConfigured,
      companyName: settings.companyName || "DevqSpace",
      welcomeMessage:
        settings.welcomeMessage ||
        "Привіт! Я AI-асистент DevqSpace. Чим можу допомогти?",
    });
  } catch (e: any) {
    return NextResponse.json(
      { enabled: false, error: e.message },
      { status: 500 },
    );
  }
}
