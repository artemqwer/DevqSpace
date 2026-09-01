import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { Footer } from "@/components/site/Footer";
import { getOrder } from "@/lib/store";
import { tgGetBotUsername } from "@/lib/telegram";
import { getTranslations } from "next-intl/server";
import { SupportTgLink } from "@/components/site/SupportTgLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявку прийнято",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; o?: string }>;
}) {
  const sp = await searchParams;
  const order = sp.o ? await getOrder(sp.o) : null;
  const showTgConnect =
    order?.contactMethod === "telegram" && !order.tgChatId;
  const botUsername = showTgConnect ? await tgGetBotUsername() : null;
  const t = await getTranslations("success");

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="orb left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 bg-neon-green opacity-20" aria-hidden />
      </div>
      <Navbar />
      <main className="relative mx-auto max-w-3xl px-4 pb-28 pt-24 text-center md:px-8 md:pb-24 md:pt-32">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-neon-green/30 bg-neon-green/10 md:mb-8 md:h-24 md:w-24">
          <i className="ph-fill ph-check text-4xl text-neon-green md:text-5xl" />
        </div>

        <span className="mono-label text-neon-green">{t("eyebrow")}</span>
        <h1 className="mb-4 mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">
          {t("headA")} <span className="text-gradient">{t("headB")}</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground md:mb-10 md:text-lg">
          {t("sub")}
        </p>

        {showTgConnect && botUsername && sp.o && (
          <div className="mb-8 rounded-2xl border border-neon-blue/30 bg-neon-blue/5 p-5 text-left md:p-6">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <i className="ph-fill ph-telegram-logo text-neon-blue" />
              {t("tgTitle")}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("tgText")}
            </p>
            <a
              href={`https://t.me/${botUsername}?start=ord_${sp.o}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <i className="ph-fill ph-telegram-logo" /> {t("tgBtn")}
            </a>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-border bg-surface/50 p-5 text-left backdrop-blur md:mb-10 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <i className="ph-fill ph-clipboard-text text-neon-blue" />
            {t("whatNext")}
          </h2>
          <ol className="space-y-3">
            <Step n="01" title={t("s1t")} text={t("s1d")} />
            <Step n="02" title={t("s2t")} text={t("s2d")} />
            <Step n="03" title={t("s3t")} text={t("s3d")} />
            <Step n="04" title={t("s4t")} text={t("s4d")} />
          </ol>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/40 px-6 py-3 font-medium text-foreground transition-colors hover:border-neon-blue/50"
          >
            <i className="ph-bold ph-arrow-left" /> {t("toCatalog")}
          </Link>
          <SupportTgLink
            label={t("writeTg")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <i className="ph-fill ph-telegram-logo" />
          </SupportTgLink>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mono-label grid h-8 w-8 shrink-0 place-items-center rounded-md border border-neon-blue/30 bg-neon-blue/10 font-bold text-neon-blue">
        {n}
      </span>
      <div>
        <div className="font-display text-sm font-bold text-foreground">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text}</div>
      </div>
    </li>
  );
}
