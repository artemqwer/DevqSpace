"use client";

import { useState, useEffect, useRef } from "react";
import type { SupportTicket, SupportSettings } from "@/lib/support/types";

export default function SupportDesk({
  initialTickets,
  initialSettings,
}: {
  initialTickets: SupportTicket[];
  initialSettings: SupportSettings & { hasApiKey: boolean };
}) {
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<"all" | "operator" | "ai" | "closed">("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Settings form state
  const [settings, setSettings] = useState(initialSettings);
  const [apiKeyInput, setApiKeyInput] = useState(initialSettings.apiKey);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for tickets update every 6 seconds when in chat tab
  useEffect(() => {
    if (activeTab !== "chat") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/support");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.tickets) {
            setTickets(data.tickets);
          }
        }
      } catch (e) {
        console.error("Failed to poll tickets:", e);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // Scroll to bottom when selected ticket changes or new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages?.length, selectedTicketId]);

  const refreshTickets = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/support");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.tickets) {
          setTickets(data.tickets);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          text: replyText.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.ticket) {
          setTickets((prev) =>
            prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)),
          );
          setReplyText("");
        }
      }
    } finally {
      setSending(false);
    }
  };

  const handleAction = async (action: "unfreeze" | "close") => {
    if (!selectedTicket) return;
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          action,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.ticket) {
          setTickets((prev) =>
            prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)),
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch("/api/admin/support/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          apiKey: apiKeyInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.settings) {
          setSettings(data.settings);
          setApiKeyInput(data.settings.apiKey);
          setSettingsSuccess(true);
          setTimeout(() => setSettingsSuccess(false), 4000);
        }
      }
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (filter === "operator")
      return t.status === "waiting_operator" || t.status === "operator_active";
    if (filter === "ai") return t.status === "ai";
    if (filter === "closed") return t.status === "closed";
    return true;
  });

  const operatorNeededCount = tickets.filter(
    (t) => t.status === "waiting_operator" || t.status === "operator_active",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <i className="ph-fill ph-chat-circle-dots text-neon-blue" />
            Підтримка клієнтів (Support Hub)
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            Гібридний режим: AI L1 перша лінія + ескалація на оператора + верифікація замовлень
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface2 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "chat"
                ? "bg-neon-blue text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <i className="ph-bold ph-chats-circle text-base" />
            Діалоги
            {operatorNeededCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-mono animate-pulse">
                {operatorNeededCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "settings"
                ? "bg-neon-blue text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <i className="ph-bold ph-gear text-base" />
            Налаштування AI & API
            {!settings.hasApiKey && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHAT DESK */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)] min-h-[580px]">
          {/* Left Column: Tickets list */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl border border-white/10 bg-surface/60 backdrop-blur overflow-hidden">
            {/* Filter header */}
            <div className="p-3 border-b border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Звернення ({filteredTickets.length})
                </span>
                <button
                  onClick={refreshTickets}
                  disabled={refreshing}
                  className="text-xs font-mono text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-1"
                >
                  <i className={`ph-bold ph-arrows-clockwise ${refreshing ? "animate-spin" : ""}`} />
                  Оновити
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: "all", label: "Всі" },
                  { id: "operator", label: "Потрібен оператор", badge: operatorNeededCount },
                  { id: "ai", label: "AI веде" },
                  { id: "closed", label: "Закриті" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                      filter === f.id
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {f.label}
                    {f.badge ? (
                      <span className="ml-1 text-red-400 font-bold">({f.badge})</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-mono text-xs">
                  Немає звернень
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = t.id === selectedTicketId;
                  const lastMsg = t.messages[t.messages.length - 1];
                  const isOperatorMode =
                    t.status === "waiting_operator" || t.status === "operator_active";

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-neon-blue/10 border-neon-blue/50 shadow-[0_0_12px_rgba(0,240,255,0.1)]"
                          : "bg-surface2/60 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {t.clientInfo?.contact || t.clientInfo?.name || "Гість сайту"}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {new Date(t.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-1 font-mono mb-2">
                        {lastMsg ? lastMsg.text : "Початок діалогу"}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            t.status === "waiting_operator"
                              ? "bg-red-500/10 text-red-400 border-red-500/30 font-bold animate-pulse"
                              : t.status === "operator_active"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : t.status === "closed"
                                  ? "bg-gray-500/10 text-gray-500 border-gray-500/30"
                                  : "bg-neon-blue/10 text-neon-blue border-neon-blue/30"
                          }`}
                        >
                          {t.status === "waiting_operator"
                            ? "🚨 Очікує оператора"
                            : t.status === "operator_active"
                              ? "👨‍💻 Діалог оператора"
                              : t.status === "closed"
                                ? "✓ Закрито"
                                : "🤖 AI веде"}
                        </span>

                        {isOperatorMode && (
                          <span className="text-[10px] font-mono text-neon-pink">
                            AI заморожено
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat messages thread & reply input */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-white/10 bg-surface/60 backdrop-blur overflow-hidden">
            {selectedTicket ? (
              <>
                {/* Header */}
                <div className="p-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-surface2/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-base truncate">
                        {selectedTicket.clientInfo?.contact ||
                          selectedTicket.clientInfo?.name ||
                          "Гість сайту"}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        #{selectedTicket.id.slice(0, 12)}
                      </span>
                    </div>

                    {selectedTicket.escalationReason && (
                      <p className="text-xs font-mono text-red-400 mt-0.5 truncate">
                        ⚡ Причина: {selectedTicket.escalationReason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(selectedTicket.status === "waiting_operator" ||
                      selectedTicket.status === "operator_active") && (
                      <button
                        onClick={() => handleAction("unfreeze")}
                        className="px-3 py-1.5 rounded-lg border border-neon-blue/40 bg-neon-blue/10 text-neon-blue text-xs font-mono hover:bg-neon-blue/20 transition-all flex items-center gap-1.5"
                        title="Розморозити AI та повернути автоматичні відповіді"
                      >
                        <i className="ph-bold ph-arrow-counter-clockwise" />
                        Вернути AI
                      </button>
                    )}

                    {selectedTicket.status !== "closed" && (
                      <button
                        onClick={() => handleAction("close")}
                        className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 text-xs font-mono hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                        title="Закрити звернення"
                      >
                        <i className="ph-bold ph-check" />
                        Закрити
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-black/20">
                  {selectedTicket.messages.map((m) => {
                    const isUser = m.sender === "user";
                    const isAi = m.sender === "ai";
                    const isOperator = m.sender === "operator";
                    const isSystem = m.sender === "system";

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isUser
                            ? "items-start"
                            : isSystem
                              ? "items-center"
                              : "items-end"
                        }`}
                      >
                        {isSystem ? (
                          <div className="max-w-md my-2 px-3 py-1.5 rounded-lg bg-surface2/80 border border-white/10 text-center text-xs font-mono text-gray-400">
                            {m.text}
                          </div>
                        ) : (
                          <div
                            className={`max-w-[85%] sm:max-w-lg p-3 rounded-2xl border text-sm leading-relaxed ${
                              isUser
                                ? "bg-surface2 text-gray-200 border-white/10 rounded-tl-sm"
                                : isOperator
                                  ? "bg-neon-pink/10 text-white border-neon-pink/30 rounded-tr-sm shadow-[0_0_12px_rgba(255,0,128,0.1)]"
                                  : "bg-neon-blue/10 text-white border-neon-blue/30 rounded-tr-sm shadow-[0_0_12px_rgba(0,240,255,0.08)]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 mb-1">
                              {isUser && <span>👤 Клієнт</span>}
                              {isOperator && (
                                <span className="text-neon-pink font-bold">
                                  👨‍💻 Ви (Оператор)
                                </span>
                              )}
                              {isAi && (
                                <span className="text-neon-blue font-bold">
                                  🤖 AI Консультант
                                </span>
                              )}
                              <span>•</span>
                              <span>
                                {new Date(m.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap">{m.text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Operator reply input */}
                <div className="p-3 border-t border-white/10 bg-surface2/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder={
                        selectedTicket.status === "closed"
                          ? "Звернення закрито. Відповідь відкриє його знову..."
                          : "Напишіть відповідь клієнту від імені підтримки..."
                      }
                      className="flex-1 bg-surface border border-white/15 focus:border-neon-blue rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                      className="px-4 py-2.5 rounded-xl bg-neon-blue text-black font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      <span>Надіслати</span>
                      <i className="ph-bold ph-paper-plane-right" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 mt-1.5 px-1">
                    <span>
                      {selectedTicket.status === "ai"
                        ? "⚠️ Відправка повідомлення автоматично перемкне чат на оператора (AI заморозиться)."
                        : "Режим прямого зв'язку з клієнтом (AI заморожено)."}
                    </span>
                    <span>Enter для відправки</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 font-mono text-sm">
                <i className="ph ph-chat-circle-dots text-5xl mb-3 text-gray-600" />
                Оберіть діалог зі списку зліва
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI & API SETTINGS */}
      {activeTab === "settings" && (
        <form
          onSubmit={handleSaveSettings}
          className="max-w-3xl space-y-6 bg-surface/60 border border-white/10 rounded-2xl p-6 backdrop-blur"
        >
          {/* Master Toggle */}
          <div className="p-4 rounded-xl border border-white/10 bg-surface2/60 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Увімкнути AI чат підтримки на сайті</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    settings.aiEnabled && settings.hasApiKey
                      ? "bg-green-500/10 text-green-400 border border-green-500/30"
                      : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {settings.aiEnabled && settings.hasApiKey ? "АКТИВНИЙ" : "ПРИХОВАНИЙ"}
                </span>
              </div>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Поки API ключ не вказано або чат вимкнено — віджет підтримки повністю прихований
                на сайті від відвідувачів.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.aiEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, aiEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-blue peer-checked:border-neon-blue"></div>
            </label>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-300">
              Провайдер LLM (Універсальний адаптер)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  id: "google",
                  label: "Google Gemini",
                  desc: "Швидкий, безкоштовний ліміт",
                  model: "gemini-2.5-flash",
                  url: "https://generativelanguage.googleapis.com/v1beta",
                  recommended: true,
                },
                {
                  id: "openai",
                  label: "OpenAI",
                  desc: "GPT-4o-mini / GPT-4o",
                  model: "gpt-4o-mini",
                  url: "https://api.openai.com/v1",
                },
                {
                  id: "deepseek",
                  label: "DeepSeek",
                  desc: "DeepSeek-V3 / Chat",
                  model: "deepseek-chat",
                  url: "https://api.deepseek.com",
                },
                {
                  id: "openrouter",
                  label: "OpenRouter",
                  desc: "Всі моделі через 1 ключ",
                  model: "google/gemini-2.5-flash",
                  url: "https://openrouter.ai/api/v1",
                },
                {
                  id: "groq",
                  label: "Groq",
                  desc: "Ультра-швидка Llama-3.3",
                  model: "llama-3.3-70b-versatile",
                  url: "https://api.groq.com/openai/v1",
                },
                {
                  id: "custom",
                  label: "Свій сервер",
                  desc: "Ollama / vLLM / Local",
                  model: settings.model || "custom",
                  url: settings.baseUrl || "http://localhost:11434/v1",
                },
              ].map((p) => {
                const isSelected = settings.provider === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setSettings({
                        ...settings,
                        provider: p.id as any,
                        baseUrl: p.url,
                        model: p.model,
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-neon-blue/10 border-neon-blue shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                        : "bg-surface2/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {p.label}
                      </span>
                      {p.recommended && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          TOP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 block mt-1">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-gray-300">
                {settings.provider === "google"
                  ? "Google Gemini API Key (отримайте безкоштовно на aistudio.google.com)"
                  : "LLM API Key"}
              </label>
              <span
                className={`text-[11px] font-mono ${
                  settings.hasApiKey ? "text-green-400" : "text-amber-400"
                }`}
              >
                {settings.hasApiKey ? "● Ключ підключено" : "○ Потрібно вказати ключ"}
              </span>
            </div>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={
                settings.provider === "google"
                  ? "AIzaSy..."
                  : "sk-..."
              }
              className="w-full bg-surface2 border border-white/15 focus:border-neon-blue rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-500 outline-none transition-colors"
            />
            <p className="text-[11px] font-mono text-gray-500">
              Ключ зберігається надійно на сервері в захищеному сховищі.
            </p>
          </div>

          {/* Base URL & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-300">
              API Base URL
            </label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              className="w-full bg-surface2 border border-white/15 focus:border-neon-blue rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
            />
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-300">
              Модель (Model)
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              placeholder="gpt-4o-mini"
              className="w-full bg-surface2 border border-white/15 focus:border-neon-blue rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-gray-500">Популярні:</span>
              {[
                "gpt-4o-mini",
                "gpt-4o",
                "deepseek-chat",
                "llama-3.3-70b-versatile",
              ].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSettings({ ...settings, model: m })}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-gray-300 hover:text-neon-blue transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-300">
              Системний промпт та регламент спілкування (L1 Knowledge Base)
            </label>
            <textarea
              rows={8}
              value={settings.systemPrompt}
              onChange={(e) =>
                setSettings({ ...settings, systemPrompt: e.target.value })
              }
              className="w-full bg-surface2 border border-white/15 focus:border-neon-blue rounded-xl p-4 text-xs font-mono text-white outline-none leading-relaxed"
            />
          </div>

          {/* Verification Security Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-white/10 bg-surface2/30">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">
                Макс. помилок верифікації
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.maxFailedVerifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxFailedVerifications: Number(e.target.value),
                  })
                }
                className="w-full bg-surface border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
              <p className="text-[10px] font-mono text-gray-500 mt-1">
                Спроб підбору контакту до замовлення
              </p>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">
                Час блокування (хвилин)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={settings.lockoutMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lockoutMinutes: Number(e.target.value),
                  })
                }
                className="w-full bg-surface border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
              <p className="text-[10px] font-mono text-gray-500 mt-1">
                Захист від брутфорсу номерів замовлень
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 rounded-xl bg-neon-blue text-black font-mono text-sm font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.45)] disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {savingSettings ? (
                <>
                  <i className="ph-bold ph-spinner-gap animate-spin" />
                  <span>Збереження...</span>
                </>
              ) : (
                <>
                  <i className="ph-bold ph-floppy-disk" />
                  <span>Зберегти налаштування</span>
                </>
              )}
            </button>

            {settingsSuccess && (
              <span className="text-xs font-mono text-green-400 flex items-center gap-1.5 animate-fadeIn">
                <i className="ph-bold ph-check-circle" />
                Налаштування збережено успішно!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
