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

  // 5. Lock body scroll on mobile when chat is open & listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    // Lock scroll on mobile only
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* CHAT CONTAINER */}
      {isOpen ? (
        <div
          className={`
            fixed z-50 font-sans flex flex-col overflow-hidden
            /* Mobile: full screen / sheet with safe-areas */
            inset-0 h-[100dvh] w-full bg-surface sm:bg-surface/95 sm:backdrop-blur-xl
            /* Desktop: floating card at bottom right */
            sm:inset-auto sm:bottom-6 sm:right-6 sm:rounded-2xl sm:border sm:border-white/15
            shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.18)]
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              isExpanded
                ? "sm:w-[480px] md:w-[520px] sm:h-[680px] sm:max-h-[90vh]"
                : "sm:w-[410px] sm:h-[570px] sm:max-h-[85vh]"
            }
          `}
        >
          {/* Header */}
          <div className="pt-[max(0.75rem,env(safe-area-inset-top))] px-3.5 sm:px-4 pb-3 border-b border-white/10 bg-surface2/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue shrink-0">
                <i className="ph-fill ph-chat-circle-dots text-lg" />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                    isFrozen ? "bg-neon-pink animate-pulse" : "bg-green-400"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-display font-bold text-white tracking-wide truncate">
                  DevqSpace Support
                </h4>
                <p className="text-[10px] font-mono text-gray-400 truncate">
                  {isFrozen ? (
                    <span className="text-neon-pink font-semibold">👨‍💻 Оператор на зв'язку</span>
                  ) : (
                    <span className="text-green-400 font-medium">⚡ AI Консультант онлайн</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Call operator quick action in header if not already escalated */}
              {!isFrozen && (
                <button
                  type="button"
                  onClick={() => handleSend("Покликати живого оператора")}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-white/5 hover:bg-neon-pink/15 text-gray-400 hover:text-neon-pink border border-white/10 hover:border-neon-pink/30 transition-colors"
                  title="Покликати живого оператора підтримки"
                >
                  <i className="ph-bold ph-headset text-xs" />
                  <span className="hidden min-[360px]:inline">Оператор</span>
                </button>
              )}

              {/* Expand / Shrink (Desktop only) */}
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="hidden sm:flex w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 items-center justify-center transition-colors"
                title={isExpanded ? "Зменшити вікно" : "Розгорнути вікно вгору"}
              >
                <i
                  className={`ph-bold text-sm ${
                    isExpanded ? "ph-arrows-in-simple" : "ph-arrows-out-simple"
                  }`}
                />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors active:scale-90"
                title="Закрити чат"
              >
                <i className="ph-bold ph-x text-base sm:text-sm" />
              </button>
            </div>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar overscroll-contain bg-black/30 text-xs [ -webkit-overflow-scrolling:touch ]">
            {/* Welcome message */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/30 flex items-center justify-center shrink-0 mt-0.5">
                <i className="ph-fill ph-robot text-xs" />
              </div>
              <div className="p-3 sm:p-3.5 rounded-2xl rounded-tl-sm bg-surface2/90 border border-white/10 text-gray-200 leading-relaxed shadow-sm max-w-[92%] sm:max-w-[88%] break-words">
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
              <div className="pt-2 space-y-1.5 sm:pl-8">
                <p className="text-[11px] font-mono text-gray-500">Швидкі запитання:</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    "📦 Який статус мого замовлення?",
                    "🛒 Які готові боти є в наявності?",
                    "☎️ Покликати живого оператора",
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="block text-left w-full px-3 py-2 sm:py-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-neon-blue/50 hover:bg-neon-blue/10 text-gray-300 hover:text-white transition-all text-xs sm:text-[11px] font-mono active:scale-98"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
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
                    <div className="my-1.5 px-3 py-1.5 rounded-xl bg-surface2/80 border border-white/10 text-center text-[11px] font-mono text-gray-400 max-w-[92%] break-words">
                      {m.text}
                    </div>
                  ) : (
                    <div
                      className={`p-3 sm:p-3.5 rounded-2xl text-[13px] sm:text-xs leading-relaxed break-words ${
                        isUser
                          ? "max-w-[85%] sm:max-w-[80%] bg-neon-blue text-black font-medium rounded-tr-sm shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                          : isOperator
                            ? "max-w-[92%] sm:max-w-[88%] bg-neon-pink/15 text-white border border-neon-pink/40 rounded-tl-sm shadow-[0_0_12px_rgba(255,0,128,0.15)]"
                            : "max-w-[92%] sm:max-w-[88%] bg-surface2 text-gray-200 border border-white/10 rounded-tl-sm shadow-sm"
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
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 pl-2 sm:pl-8">
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

          {/* Footer input with mobile safe area padding */}
          <div className="p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-surface2/95 sm:bg-surface2/80 space-y-1.5 shrink-0">
            {isFrozen && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-[10px] font-mono text-neon-pink">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse shrink-0" />
                <span className="truncate">AI призупинено. Ви спілкуєтеся з оператором підтримки.</span>
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
                /* text-base on mobile prevents iOS Safari automatic page zoom */
                className="flex-1 bg-surface border border-white/10 focus:border-neon-blue rounded-xl px-3.5 py-2.5 sm:py-2 text-base sm:text-xs text-white placeholder-gray-500 outline-none transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl bg-neon-blue text-black flex items-center justify-center hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-30 transition-all shrink-0 active:scale-95"
                title="Надіслати"
              >
                <i className="ph-bold ph-paper-plane-right text-sm sm:text-xs" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* FLOATING LAUNCH BUTTON WITH MOBILE SAFE AREA INSETS */
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full bg-surface2/90 border border-white/20 hover:border-neon-blue text-white shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.45)] active:scale-90 transition-all duration-200 backdrop-blur-md"
            title="Відкрити підтримку DevqSpace"
          >
            <div className="relative w-6 h-6 rounded-full bg-neon-blue text-black flex items-center justify-center shrink-0">
              <i className="ph-fill ph-chat-circle-dots text-sm" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 ring-2 ring-black animate-pulse" />
            </div>

            <span className="text-xs font-mono font-medium text-gray-200 group-hover:text-white transition-colors hidden sm:inline">
              Підтримка
            </span>
          </button>
        </div>
      )}
    </>
  );
}
