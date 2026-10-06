import { getSettings } from "@/lib/settings";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// HEADER ANNOUNCEMENTS & BANNERS"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Оголошення в хедері
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Керуй оголошеннями вгорі сайту (як у Luminex): налаштовуй біжучий рядок (marquee) або статичний банер, промо-акції, посилання на каталог або знижки.
        </p>
      </div>

      <AnnouncementsManager settings={settings} />
    </div>
  );
}
