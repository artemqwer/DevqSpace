import { getContentOverrides } from "@/lib/store";
import { defaultsFlat } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [ukOverrides, enOverrides] = await Promise.all([
    getContentOverrides("uk"),
    getContentOverrides("en"),
  ]);

  const changed =
    Object.keys(ukOverrides).length + Object.keys(enOverrides).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// CONTENT"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Тексти сайту{" "}
          {changed > 0 && (
            <span className="text-neon-purple text-lg">({changed} змінено)</span>
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Правки перекривають тексти з коду. «Скинути» повертає початковий
          варіант. Зміни на сайті — одразу після збереження.
        </p>
      </div>

      <ContentEditor
        exclude="legal"
        defaults={{ uk: defaultsFlat("uk"), en: defaultsFlat("en") }}
        overrides={{ uk: ukOverrides, en: enOverrides }}
      />
    </div>
  );
}
