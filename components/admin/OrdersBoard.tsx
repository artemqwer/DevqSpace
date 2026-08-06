"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredOrder, OrderStatus, DeliveryStatus } from "@/lib/store";

const STATUSES: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "Усі" },
  { id: "new", label: "Нові" },
  { id: "in_progress", label: "В роботі" },
  { id: "done", label: "Закриті" },
  { id: "rejected", label: "Відхилені" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  done: "bg-neon-green/10 text-neon-green border-neon-green/30",
  rejected: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
};

// Стан збірки й видачі персонального архіву. Кольори — з тієї ж палітри,
// що й статуси замовлення вище.
const DELIVERY_STYLE: Record<DeliveryStatus, string> = {
  PENDING: "bg-white/5 text-gray-400 border-white/10",
  GENERATING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  SENT: "bg-neon-green/10 text-neon-green border-neon-green/30",
  FAILED: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
};

const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Очікує",
  GENERATING: "Збирається",
  SENT: "Видано",
  FAILED: "Помилка",
};

const DELIVERY_ICON: Record<DeliveryStatus, string> = {
  PENDING: "ph-hourglass",
  GENERATING: "ph-spinner-gap",
  SENT: "ph-paper-plane-tilt",
  FAILED: "ph-warning-circle",
};

function deliveryOf(o: StoredOrder): DeliveryStatus {
  return o.deliveryStatus ?? (o.delivered ? "SENT" : "PENDING");
}

const NEXT_STATUS: { id: OrderStatus; label: string; icon: string }[] = [
  { id: "new", label: "Нове", icon: "ph-sparkle" },
  { id: "in_progress", label: "В роботі", icon: "ph-spinner-gap" },
  { id: "done", label: "Закрити", icon: "ph-check" },
  { id: "rejected", label: "Відхилити", icon: "ph-x" },
];

export default function OrdersBoard({
  initialOrders,
  maskedEnv = {},
}: {
  initialOrders: StoredOrder[];
  // orderId -> [ключ, замасковане значення][]. Самі токени сюди не потрапляють.
  maskedEnv?: Record<string, [string, string][]>;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [regenNote, setRegenNote] = useState<Record<string, string>>({});

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const setStatus = async (id: string, status: OrderStatus) => {
    setBusy(id);
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy(null);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Видалити замовлення?")) return;
    setBusy(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setBusy(null);
    router.refresh();
  };

  const markPaid = async (id: string) => {
    setBusy(id);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              paid: true,
              paidAt: Date.now(),
              status: o.status === "new" ? "in_progress" : o.status,
            }
          : o,
      ),
    );
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paid: true }),
    });
    setBusy(null);
    router.refresh();
  };

  // Пересобрати архів і надіслати заново — для замовлень, що впали.
  const regenerate = async (id: string) => {
    setBusy(id);
    setRegenNote((p) => ({ ...p, [id]: "" }));
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, deliveryStatus: "GENERATING" } : o,
      ),
    );
    try {
      const res = await fetch("/api/admin/orders/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        note?: string;
      };
      setRegenNote((p) => ({
        ...p,
        [id]: data.ok
          ? "Готово — архів зібрано і надіслано"
          : data.error || "Не вдалося",
      }));
    } catch {
      setRegenNote((p) => ({ ...p, [id]: "Помилка мережі" }));
    }
    setBusy(null);
    router.refresh();
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-1">
        {STATUSES.map((s) => {
          const count =
            s.id === "all"
              ? orders.length
              : orders.filter((o) => o.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
                filter === s.id
                  ? "bg-neon-blue text-black border-neon-blue"
                  : "bg-surface2 text-gray-400 border-white/10 hover:text-white"
              }`}
            >
              {s.label}
              <span
                className={filter === s.id ? "text-black/60" : "text-gray-600"}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-10 text-center text-sm font-mono text-gray-500">
          Замовлень немає
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const open = openId === o.id;
            return (
              <div
                key={o.id}
                className="rounded-xl border border-white/10 bg-surface/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                >
                  <span
                    className={`w-9 h-9 rounded-lg bg-surface2 border border-white/10 flex items-center justify-center shrink-0 ${o.type === "product" ? "text-neon-blue" : "text-neon-pink"}`}
                  >
                    <i
                      className={`ph ${o.type === "product" ? "ph-package" : "ph-wrench"}`}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white truncate">
                      {o.type === "product" ? o.productTitle : o.customType}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 truncate">
                      {o.name} · {new Date(o.createdAt).toLocaleString("uk-UA")}
                    </div>
                  </div>
                  {o.type === "product" && o.productPrice ? (
                    <span className="text-sm font-display font-bold text-white shrink-0">
                      ${o.productPrice}
                    </span>
                  ) : null}
                  {o.paid && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 bg-neon-green/10 text-neon-green border-neon-green/30 flex items-center gap-1">
                      <i className="ph-fill ph-check-circle" /> Оплачено
                    </span>
                  )}
                  {o.type === "product" && deliveryOf(o) !== "PENDING" && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 items-center gap-1 hidden sm:flex ${DELIVERY_STYLE[deliveryOf(o)]}`}
                    >
                      <i
                        className={`ph-bold ${DELIVERY_ICON[deliveryOf(o)]} ${deliveryOf(o) === "GENERATING" ? "animate-spin" : ""}`}
                      />
                      {DELIVERY_LABEL[deliveryOf(o)]}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${STATUS_STYLE[o.status]}`}
                  >
                    {STATUSES.find((s) => s.id === o.status)?.label}
                  </span>
                  <i
                    className={`ph ph-caret-down text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
                      <Row label="Контакт">
                        <CopyText text={o.contact} />{" "}
                        <span className="text-gray-600">
                          ({o.contactMethod})
                        </span>
                      </Row>
                      <Row label="Ім'я">{o.name}</Row>
                      {o.type === "product" ? (
                        <Row label="Slug">{o.productSlug}</Row>
                      ) : (
                        <>
                          <Row label="Бюджет">{o.budget}</Row>
                          <Row label="Дедлайн">{o.deadline}</Row>
                        </>
                      )}
                      <Row label="ID">{o.id}</Row>
                      {o.payMethod && (
                        <Row label="Спосіб">
                          {o.payMethod === "jar"
                            ? "Картка (банка)"
                            : "Крипта"}
                        </Row>
                      )}
                      {o.paid && (
                        <Row label="Оплата">
                          <span className="text-neon-green">
                            {o.payAmount} {o.payAsset} ·{" "}
                            {o.paidAt
                              ? new Date(o.paidAt).toLocaleString("uk-UA")
                              : "оплачено"}
                          </span>
                        </Row>
                      )}
                    </dl>

                    {o.message && (
                      <div className="text-xs text-gray-300 bg-surface2 rounded-lg p-3 whitespace-pre-wrap">
                        {o.message}
                      </div>
                    )}

                    {/* Динамічна упаковка: що ввів клієнт і чим усе скінчилось */}
                    {maskedEnv[o.id]?.length ? (
                      <div className="bg-surface2 rounded-lg p-3">
                        <div className="text-[10px] font-mono text-neon-purple uppercase tracking-wider mb-2">
                          {"// .env клієнта"}
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
                          {maskedEnv[o.id].map(([k, v]) => (
                            <div key={k} className="flex gap-2 min-w-0">
                              <dt className="text-gray-500 shrink-0">{k}</dt>
                              <dd className="text-gray-300 truncate">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ) : null}

                    {o.errorMessage && (
                      <div className="text-xs font-mono text-neon-pink bg-neon-pink/5 border border-neon-pink/20 rounded-lg p-3 flex items-start gap-2">
                        <i className="ph-fill ph-warning-circle mt-0.5 shrink-0" />
                        <span className="break-words">{o.errorMessage}</span>
                      </div>
                    )}

                    {regenNote[o.id] && (
                      <div className="text-xs font-mono text-gray-400">
                        {regenNote[o.id]}
                      </div>
                    )}

                    {/* Status controls */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {NEXT_STATUS.map((s) => (
                        <button
                          key={s.id}
                          disabled={busy === o.id || o.status === s.id}
                          onClick={() => setStatus(o.id, s.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all disabled:opacity-40 ${
                            o.status === s.id
                              ? STATUS_STYLE[s.id]
                              : "bg-surface2 border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          <i className={`ph-bold ${s.icon}`} /> {s.label}
                        </button>
                      ))}
                      <a
                        href={
                          o.contactMethod === "telegram"
                            ? `https://t.me/${o.contact.replace(/^@/, "")}`
                            : o.contactMethod === "email"
                              ? `mailto:${o.contact}`
                              : `tel:${o.contact}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-xs font-mono"
                      >
                        <i className="ph-bold ph-chat-circle" /> Написати
                      </a>
                      {o.type === "product" && o.paid && (
                        <button
                          onClick={() => regenerate(o.id)}
                          disabled={busy === o.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-purple/30 bg-neon-purple/10 text-neon-purple text-xs font-mono transition-colors disabled:opacity-40"
                        >
                          <i
                            className={`ph-bold ph-arrows-clockwise ${busy === o.id ? "animate-spin" : ""}`}
                          />
                          Перегенерувати і надіслати
                        </button>
                      )}
                      {!o.paid && (
                        <button
                          onClick={() => markPaid(o.id)}
                          disabled={busy === o.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-green/30 bg-neon-green/10 text-neon-green text-xs font-mono transition-colors disabled:opacity-40"
                        >
                          <i className="ph-bold ph-money" /> Оплачено
                        </button>
                      )}
                      <button
                        onClick={() => remove(o.id)}
                        disabled={busy === o.id}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-neon-pink hover:border-neon-pink/30 text-xs font-mono transition-colors"
                      >
                        <i className="ph-bold ph-trash" /> Видалити
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500 shrink-0">{label}:</dt>
      <dd className="text-gray-200 truncate">{children}</dd>
    </div>
  );
}

function CopyText({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(text)}
      className="text-neon-blue hover:underline"
      title="Копіювати"
    >
      {text}
    </button>
  );
}
