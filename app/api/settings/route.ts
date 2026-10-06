import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    return Response.json({
      ok: true,
      announcement: {
        enabled: settings.announcementEnabled,
        text: settings.announcementText,
        mode: settings.announcementMode,
        bg: settings.announcementBg,
        link: settings.announcementLink,
        linkText: settings.announcementLinkText,
      },
    });
  } catch (e) {
    return Response.json({ ok: false, error: "Unavailable" }, { status: 500 });
  }
}
