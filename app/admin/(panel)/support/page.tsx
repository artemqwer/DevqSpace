import { getAllTickets, getSupportSettings } from "@/lib/support/store";
import SupportDesk from "@/components/admin/SupportDesk";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Підтримка клієнтів (Support Hub) — DevqSpace Admin",
};

export default async function SupportPage() {
  const [tickets, settings] = await Promise.all([
    getAllTickets(100),
    getSupportSettings(),
  ]);

  const maskedKey = settings.apiKey
    ? settings.apiKey.length > 8
      ? `${settings.apiKey.slice(0, 3)}••••••••${settings.apiKey.slice(-4)}`
      : "••••••••"
    : "";

  return (
    <SupportDesk
      initialTickets={tickets}
      initialSettings={{
        ...settings,
        apiKey: maskedKey,
        hasApiKey: Boolean(settings.apiKey && settings.apiKey.trim().length > 0),
      }}
    />
  );
}
