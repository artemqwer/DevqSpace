import { getContentOverrides } from "@/lib/store";
import { defaultsFlat } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import LegalSettings from "@/components/admin/LegalSettings";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

const DOC_LABEL: Record<string, string> = {
  terms: "Публічна оферта",
  privacy: "Конфіденційність",
  refund: "Повернення",
  footerLegal: "Підпис у футері",
};

export default async function AdminLegalPage() {
  const [settings, ukOverrides, enOverrides] = await Promise.all([
    getSettings(),
    getContentOverrides("uk"),
    getContentOverrides("en"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// LEGAL"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Реквізити та документи{" "}
          <span
            className={`text-lg ${settings.legalEnabled ? "text-neon-green" : "text-gray-500"}`}
          >
            ({settings.legalEnabled ? "опубліковано" : "приховано"})
          </span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Оферта, конфіденційність і умови повернення. Тексти — шаблонні, під
          продаж цифрових товарів; реквізити підставляються з полів нижче.
        </p>
      </div>

      <LegalSettings settings={settings} />

      <div>
        <h2 className="mb-3 text-sm font-display font-bold text-white">
          Тексти документів
        </h2>
        <ContentEditor
          only="legal"
          labels={DOC_LABEL}
          defaults={{ uk: defaultsFlat("uk"), en: defaultsFlat("en") }}
          overrides={{ uk: ukOverrides, en: enOverrides }}
        />
      </div>
    </div>
  );
}
