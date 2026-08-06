"use client";

import { useState } from "react";
import type { DevMail } from "@/lib/email";
import type { DevTgMessage } from "@/lib/telegram";

type Row<T> = { id: string; at: number; data: T };

export default function DevInboxTabs({
  mail,
  tg,
}: {
  mail: Row<DevMail>[];
  tg: Row<DevTgMessage>[];
}) {
  const [tab, setTab] = useState<"mail" | "tg">("mail");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Tab active={tab === "mail"} onClick={() => setTab("mail")} count={mail.length}>
          <i className="ph-bold ph-envelope-simple" /> Пошта
        </Tab>
        <Tab active={tab === "tg"} onClick={() => setTab("tg")} count={tg.length}>
          <i className="ph-fill ph-telegram-logo" /> Telegram
        </Tab>
      </div>

      {tab === "mail" ? (
        mail.length === 0 ? (
          <Empty>Листів ще не було</Empty>
        ) : (
          <div className="space-y-2">
            {mail.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-surface/50"
              >
                <button
                  onClick={() => setOpenId(openId === m.id ? null : m.id)}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-surface2 text-neon-blue">
                    <i className="ph-bold ph-envelope-simple" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">
                      {m.data.subject}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-gray-500">
                      → {m.data.to}
                    </span>
                  </span>
                  <time className="shrink-0 font-mono text-[11px] text-gray-600">
                    {new Date(m.at).toLocaleTimeString("uk-UA")}
                  </time>
                </button>
                {openId === m.id && (
                  <div className="border-t border-white/5 bg-surface2/40 p-3">
                    <iframe
                      srcDoc={m.data.html}
                      title={m.data.subject}
                      sandbox=""
                      className="h-[420px] w-full rounded-lg border border-white/10 bg-white/5"
                    />
                    <p className="mt-2 font-mono text-[11px] text-gray-600">
                      Посилання всередині листа робочі — відкривай у новій вкладці.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : tg.length === 0 ? (
        <Empty>Повідомлень ще не було</Empty>
      ) : (
        <div className="space-y-2">
          {tg.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-white/10 bg-surface/50 p-3"
            >
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] text-gray-500">
                <span className="rounded border border-white/10 bg-surface2 px-1.5 py-0.5 text-neon-blue">
                  {m.data.kind}
                </span>
                <span>chat {String(m.data.chatId)}</span>
                <time className="ml-auto text-gray-600">
                  {new Date(m.at).toLocaleTimeString("uk-UA")}
                </time>
              </div>
              {m.data.documentUrl && (
                <a
                  href={m.data.documentUrl}
                  className="mb-2 inline-flex items-center gap-1.5 font-mono text-xs text-neon-green hover:underline"
                >
                  <i className="ph-bold ph-file-zip" /> вкладення
                </a>
              )}
              {m.data.text && (
                <div
                  className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-300 [&_a]:text-neon-blue [&_b]:text-white [&_code]:font-mono [&_code]:text-neon-pink"
                  dangerouslySetInnerHTML={{ __html: m.data.text }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
        active
          ? "border-neon-blue bg-neon-blue text-black"
          : "border-white/10 bg-surface2 text-gray-400 hover:text-white"
      }`}
    >
      {children}
      <span className={active ? "text-black/60" : "text-gray-600"}>{count}</span>
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/50 p-10 text-center font-mono text-sm text-gray-500">
      {children}
    </div>
  );
}
