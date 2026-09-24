"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import SupportMarkdown from "./SupportMarkdown";

type Message = {
  id: string;
  sender: "user" | "ai" | "operator" | "system";
  text: string;
  timestamp: number;
};

export default function SupportChatWidget() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-expand window upwards when multi-line or long messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const hasSubstantialMessage = messages.some(
        (m) => m.text.length > 100 || m.text.includes("\n"),
      );
      if (hasSubstantialMessage) {
        setIsExpanded(true);
      }
    }
  }, [messages]);

  // 1. Initial check: DO NOT RENDER IF API IS NOT SET OR DISABLED
  useEffect(() => {
    // Не показувати чат на сторінках адмінки
    if (pathname?.startsWith("/admin")) return;

    async function checkConfig() {
      try {
        const res = await fetch("/api/support/config");
        if (res.ok) {
          const data = await res.json();
          if (data.enabled) {
            setEnabled(true);
            setWelcomeMessage(data.welcomeMessage);
          } else {
            setEnabled(false);
          }
        }
      } catch {
        setEnabled(false);
      }
    }
    checkConfig();
  }, [pathname]);

  // 2. Initialize or restore session ID from localStorage
  useEffect(() => {
    if (!enabled) return;
    let sId = localStorage.getItem("devq_support_sid");
    if (!sId) {
      sId = `sess_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
      localStorage.setItem("devq_support_sid", sId);
    }
    setSessionId(sId);

    // Fetch existing chat history if any
    fetch(`/api/support/chat?sessionId=${sId}&_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.ticket) {
          setMessages(data.ticket.messages || []);
          setIsFrozen(data.ticket.isFrozen || false);
        }
      })
      .catch(() => {});
  }, [enabled]);

  // 3. Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // 4. Poll for operator replies while chat window is open
  useEffect(() => {
    if (!enabled || !isOpen || !sessionId) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(
          `/api/support/chat?sessionId=${sessionId}&_t=${Date.now()}`,
          { cache: "no-store" },
        );
        if (r.ok) {
          const data = await r.json();
          if (data.ok && data.ticket) {
            setMessages(data.ticket.messages || []);
            setIsFrozen(data.ticket.isFrozen || false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [enabled, isOpen, sessionId]);

  // If disabled, not configured, or on admin page -> RENDER NOTHING!
  if (!enabled || pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading || !sessionId) return;

    const tempUserMsg: Message = {
      id: `tmp_${Date.now()}`,
      sender: "user",
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          sessionId,
          message: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setMessages(data.messages || []);
          setIsFrozen(Boolean(data.isFrozen));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: "system",
            text: errData.error || "Не вдалося надіслати повідомлення.",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (e) {
      console.error("Chat send error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* CHAT WINDOW DRAWER */}
      {isOpen ? (
        <div
          className={`
            rounded-2xl border border-white/15 bg-surface/95 backdrop-blur-xl
            shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(0,240,255,0.18)]
            flex flex-col overflow-hidden
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              isExpanded
                ? "w-[calc(100vw-24px)] sm:w-[460px] md:w-[500px] h-[640px] sm:h-[690px] max-h-[90vh]"
                : "w-[calc(100vw-32px)] sm:w-[390px] h-[510px] max-h-[82vh]"
            }
          `}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 bg-surface2/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
                <i className="ph-fill ph-chat-circle-dots text-lg" />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                    isFrozen ? "bg-neon-pink animate-pulse" : "bg-green-400"
                  }`}
                />
              </div>
              <div>
                <h4 className="text-xs font-display font-bold text-white tracking-wide">
                  DevqSpace Support
                </h4>
                <p className="text-[10px] font-mono text-gray-400">
                  {isFrozen ? (
                    <span className="text-neon-pink">👨‍💻 Оператор на зв'язку</span>
                  ) : (
                    <span className="text-green-400">⚡ AI Консультант онлайн</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title={isExpanded ? "Зменшити вікно" : "Розгорнути вікно вгору"}
              >
                <i
                  className={`ph-bold text-sm ${
                    isExpanded ? "ph-arrows-in-simple" : "ph-arrows-out-simple"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Закрити чат"
              >
                <i className="ph-bold ph-x text-sm" />
              </button>
            </div>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/30 text-xs">
            {/* Initial Welcome Message */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/30 flex items-center justify-center shrink-0 mt-0.5">
                <i className="ph-fill ph-robot text-xs" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-sm bg-surface2/90 border border-white/10 text-gray-200 leading-relaxed shadow-sm max-w-[95%]">
                <SupportMarkdown
                  content={
                    welcomeMessage ||
                    "Привіт! Я AI-асистент DevqSpace. Допоможу з вибором готового рішення, статусом замовлення або відповім на технічні запитання. Чим можу допомогти?"
                  }
                />
              </div>
            </div>

            {/* Quick Action Chips when dialogue is short */}
            {messages.length === 0 && (
              <div className="pt-2 space-y-1.5 pl-8">
                <p className="text-[11px] font-mono text-gray-500">Швидкі запитання:</p>
                {[
                  "📦 Який статус мого замовлення?",
                  "🛒 Які готові боти є в наявності?",
                  "☎️ Покликати живого оператора",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="block text-left w-full px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-neon-blue/50 hover:bg-neon-blue/10 text-gray-300 hover:text-white transition-all text-[11px] font-mono"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Message stream */}
            {messages.map((m) => {
              const isUser = m.sender === "user";
              const isOperator = m.sender === "operator";
              const isSystem = m.sender === "system";

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    isUser
                      ? "items-end"
                      : isSystem
                        ? "items-center"
                        : "items-start"
                  }`}
                >
                  {isSystem ? (
                    <div className="my-1.5 px-3 py-1.5 rounded-xl bg-surface2/80 border border-white/10 text-center text-[11px] font-mono text-gray-400 max-w-[90%]">
                      {m.text}
                    </div>
                  ) : (
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "max-w-[85%] sm:max-w-[80%] bg-neon-blue text-black font-medium rounded-tr-sm shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                          : isOperator
                            ? "max-w-[95%] sm:max-w-[92%] bg-neon-pink/15 text-white border border-neon-pink/40 rounded-tl-sm shadow-[0_0_12px_rgba(255,0,128,0.15)]"
                            : "max-w-[95%] sm:max-w-[92%] bg-surface2 text-gray-200 border border-white/10 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 mb-1.5 pb-1 border-b border-white/5">
                          {isOperator ? (
                            <span className="text-neon-pink font-bold flex items-center gap-1">
                              <i className="ph-fill ph-headset" />
                              👨‍💻 Оператор DevqSpace
                            </span>
                          ) : (
                            <span className="text-neon-blue font-bold flex items-center gap-1">
                              <i className="ph-fill ph-robot" />
                              🤖 AI Консультант
                            </span>
                          )}
                        </div>
                      )}
                      <SupportMarkdown content={m.text} isUser={isUser} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 pl-8">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">
                  {isFrozen ? "Надсилаю оператору..." : "Готую відповідь..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer input */}
          <div className="p-2.5 border-t border-white/10 bg-surface2/80 space-y-1.5">
            {isFrozen && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-[10px] font-mono text-neon-pink">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
                <span>AI призупинено. Ви спілкуєтеся з оператором підтримки.</span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isFrozen
                    ? "Повідомлення для оператора..."
                    : "Запитайте будь-що..."
                }
                className="flex-1 bg-surface border border-white/10 focus:border-neon-blue rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-8 h-8 rounded-xl bg-neon-blue text-black flex items-center justify-center hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-30 transition-all shrink-0"
              >
                <i className="ph-bold ph-paper-plane-right text-xs" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* FLOATING LAUNCH BUTTON */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-surface2/90 border border-white/20 hover:border-neon-blue text-white shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.45)] active:scale-95 transition-all duration-200 backdrop-blur-md"
        >
          <div className="relative w-6 h-6 rounded-full bg-neon-blue text-black flex items-center justify-center shrink-0">
            <i className="ph-fill ph-chat-circle-dots text-sm" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 ring-2 ring-black" />
          </div>

          <span className="text-xs font-mono font-medium text-gray-200 group-hover:text-white transition-colors hidden sm:inline">
            Підтримка
          </span>
        </button>
      )}
    </div>
  );
}
