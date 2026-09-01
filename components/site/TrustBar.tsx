import { UsersThree, ShieldCheck, Code, CreditCard } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

export function TrustBar() {
  const t = useTranslations("trust");
  const items = [
    { icon: UsersThree, value: "320+", label: t("clients") },
    { icon: ShieldCheck, value: t("warrantyV"), label: t("warrantyL") },
    { icon: Code, value: t("sourceV"), label: t("sourceL") },
    { icon: CreditCard, value: t("payV"), label: t("payL") },
  ];
  return (
    <section aria-label="Довіра та гарантії" className="border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 md:grid-cols-4 md:px-6">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={value} className="flex items-center gap-3 py-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2/60 text-neon-blue">
              <Icon weight="duotone" className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">{value}</div>
              <div className="mono-label text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
