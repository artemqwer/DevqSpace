"use client";

import React from "react";

/**
 * Парсер інлайн-форматування (bold, italic, code, links).
 */
function parseInline(text: string, isUser = false): React.ReactNode[] {
  // Токенізатор для **bold**, *italic*, `code`, [link](url)
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // **Bold**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={i}
          className={
            isUser ? "font-bold text-black" : "font-semibold text-white tracking-wide"
          }
        >
          {inner}
        </strong>
      );
    }

    // *Italic*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={i} className="italic opacity-90">
          {inner}
        </em>
      );
    }

    // `Code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono break-all inline-block max-w-full ${
            isUser
              ? "bg-black/20 text-black font-semibold"
              : "bg-white/10 text-neon-blue border border-white/10"
          }`}
        >
          {inner}
        </code>
      );
    }

    // [Link](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isUser
              ? "underline font-bold text-black hover:opacity-80 break-all"
              : "text-neon-blue hover:text-white underline underline-offset-2 transition-colors font-medium break-all"
          }
        >
          {label}
        </a>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

/**
 * Компонент рендерингу форматованих повідомлень чату підтримки DevqSpace.
 * Підтримує списки (нумеровані та марковані), жирний шрифт, посилання, код та абзаци.
 */
export function SupportMarkdown({
  content,
  isUser = false,
}: {
  content: string;
  isUser?: boolean;
}) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = (key: string | number) => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join("\n");
      elements.push(
        <p
          key={`p-${key}`}
          className={`leading-relaxed ${
            isUser ? "text-black" : "text-gray-200"
          } whitespace-pre-line`}
        >
          {parseInline(text, isUser)}
        </p>,
      );
      currentParagraphLines = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Порожній рядок — розділювач абзаців
    if (!trimmed) {
      flushParagraph(index);
      return;
    }

    // 2. Нумерований список (напр. "1. **Telegram Shop** — ...")
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      flushParagraph(index);
      const [, num, itemContent] = numMatch;
      elements.push(
        <div
          key={`num-${index}`}
          className="flex items-start gap-2.5 my-1.5 text-xs leading-relaxed"
        >
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-mono font-bold shrink-0 mt-0.5 border ${
              isUser
                ? "bg-black/15 text-black border-black/30"
                : "bg-neon-blue/15 text-neon-blue border-neon-blue/30 shadow-[0_0_8px_rgba(0,240,255,0.15)]"
            }`}
          >
            {num}
          </span>
          <div className={`flex-1 min-w-0 pt-0.5 ${isUser ? "text-black" : "text-gray-200"}`}>
            {parseInline(itemContent, isUser)}
          </div>
        </div>,
      );
      return;
    }

    // 3. Маркований список (напр. "- Товар 1", "* Пункт")
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph(index);
      const [, itemContent] = bulletMatch;
      elements.push(
        <div
          key={`bullet-${index}`}
          className="flex items-start gap-2 my-1 text-xs leading-relaxed"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${
              isUser ? "bg-black" : "bg-neon-blue shadow-[0_0_6px_rgba(0,240,255,0.6)]"
            }`}
          />
          <div className={`flex-1 min-w-0 ${isUser ? "text-black" : "text-gray-200"}`}>
            {parseInline(itemContent, isUser)}
          </div>
        </div>,
      );
      return;
    }

    // Звичайний рядок — накопичуємо в абзац
    currentParagraphLines.push(trimmed);
  });

  // Додаємо залишковий абзац
  flushParagraph("end");

  return (
    <div className="space-y-2 break-words [overflow-wrap:anywhere] max-w-full">
      {elements}
    </div>
  );
}

export default SupportMarkdown;
