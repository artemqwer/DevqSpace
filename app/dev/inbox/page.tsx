import { notFound } from "next/navigation";
import Link from "next/link";
import { devRouteBlocked } from "@/lib/devStubs";
import { devListMessages, type DevMessage } from "@/lib/devStorage";
import type { DevMail } from "@/lib/email";
import type { DevTgMessage } from "@/lib/telegram";
import DevInboxTabs from "@/components/dev/DevInboxTabs";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dev · Вихідні повідомлення" };

export default async function DevInboxPage() {
  if (devRouteBlocked()) notFound();

  const mail = devListMessages<DevMail>("mail", 50);
  const tg = devListMessages<DevTgMessage>("tg", 50);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0"
        aria-hidden
      />
      <main className="relative mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-6 flex flex-col gap-2">
          <span className="mono-label text-neon-pink">{"// dev-заглушка"}</span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Вихідні <span className="text-gradient">повідомлення</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Листи Resend і повідомлення Telegram, які локально нікуди не
            надсилаються. У проді цієї сторінки не існує.
          </p>
        </div>

        <DevInboxTabs
          mail={serialize(mail)}
          tg={serialize(tg)}
        />

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1 font-mono text-xs text-gray-500 transition-colors hover:text-white"
        >
          <i className="ph-bold ph-arrow-left" /> на сайт
        </Link>
      </main>
    </div>
  );
}

// Server Component → Client Component: віддаємо звичайні об'єкти.
function serialize<T>(rows: DevMessage<T>[]) {
  return rows.map((r) => ({ id: r.id, at: r.at, data: r.data }));
}
