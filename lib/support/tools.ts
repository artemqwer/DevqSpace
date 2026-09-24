import "server-only";
import { PRODUCTS, type Product } from "@/lib/products";
import { verifyAndGetOrder as verifyOrderSafe } from "./verifier";

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  };
};

export const SUPPORT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "searchCatalog",
      description:
        "Пошук готових продуктів у каталозі DevqSpace за ключовими словами або категорією. Використовуй, коли клієнт запитує наявність рішень, ботів, шаблонів чи сайтів.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Ключове слово для пошуку (напр. 'бот', 'крипто', 'магазин', 'flutter', 'parser')",
          },
          category: {
            type: "string",
            description:
              "Опційна категорія: 'telegram-bots', 'web', 'mobile', 'automation', 'web3', 'templates'",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkProductStock",
      description:
        "Отримати детальну інформацію про конкретний продукт за його назвою або slug (наявність, ціна, комплектація, посилання на демо).",
      parameters: {
        type: "object",
        properties: {
          slugOrTitle: {
            type: "string",
            description: "Slug або приблизна назва продукту з каталогу",
          },
        },
        required: ["slugOrTitle"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "verifyAndGetOrder",
      description:
        "Безпечна перевірка статусу замовлення. УВАГА: вимагає обов'язкового підтвердження контакту (email або телефон), щоб не розкрити дані третім особам.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "Номер замовлення клієнта (напр. 'ORD-12345' або 'ord_abc')",
          },
          confirmationData: {
            type: "string",
            description:
              "Email або номер телефону клієнта для перевірки збігу з даними замовлення. Якщо клієнт не надав, передавати порожній рядок або не викликати.",
          },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalateToHuman",
      description:
        "Передати діалог живому оператору підтримки (Human Handoff). Викликай, якщо клієнт просить оператора, незадоволений, виник конфлікт або потрібна індивідуальна оцінка кастомної розробки.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Коротка причина передачі оператору",
          },
          urgency: {
            type: "string",
            enum: ["normal", "high", "critical"],
            description: "Рівень терміновості",
          },
        },
        required: ["reason"],
      },
    },
  },
];

export async function executeTool(
  toolName: string,
  args: Record<string, any>,
  context: { sessionId: string; onEscalate?: (reason: string) => Promise<void> },
): Promise<string> {
  switch (toolName) {
    case "searchCatalog": {
      const q = (args.query || "").toLowerCase().trim();
      const cat = args.category;
      let matched = PRODUCTS.filter((p) => {
        if (cat && p.category !== cat) return false;
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      });

      if (!matched.length && q) {
        // Fallback: relax words
        const words = q.split(/\s+/).filter((w: string) => w.length > 2);
        matched = PRODUCTS.filter((p) =>
          words.some(
            (w: string) =>
              p.title.toLowerCase().includes(w) ||
              p.tagline.toLowerCase().includes(w) ||
              p.category.includes(w),
          ),
        );
      }

      if (!matched.length) {
        return JSON.stringify({
          found: 0,
          message: `На жаль, за запитом "${q}" готових рішень не знайдено. Ми також розробляємо кастомні проекти під ключ (/custom).`,
        });
      }

      const results = matched.slice(0, 4).map((p) => ({
        title: p.title,
        category: p.category,
        tagline: p.tagline,
        url: `/catalog/${p.slug}`,
      }));

      return JSON.stringify({
        found: matched.length,
        items: results,
      });
    }

    case "checkProductStock": {
      const target = (args.slugOrTitle || "").toLowerCase().trim();
      const product = PRODUCTS.find(
        (p) =>
          p.slug.toLowerCase() === target ||
          p.title.toLowerCase().includes(target),
      );

      if (!product) {
        return JSON.stringify({
          found: false,
          message: `Продукт "${target}" не знайдено в каталозі. Можливо, вказано іншу назву?`,
        });
      }

      return JSON.stringify({
        found: true,
        product: {
          title: product.title,
          category: product.category,
          tagline: product.tagline,
          description: product.description.slice(0, 200) + "...",
          url: `/catalog/${product.slug}`,
          delivery: "Миттєва автоматична видача персонального ZIP-архіву 24/7 одразу після оплати",
          guarantee: "Гарантія працездатності та безкоштовні оновлення 1 рік",
        },
      });
    }

    case "verifyAndGetOrder": {
      const orderId = String(args.orderId || "");
      const confirm = args.confirmationData ? String(args.confirmationData) : undefined;
      const res = await verifyOrderSafe(context.sessionId, orderId, confirm);
      return JSON.stringify(res);
    }

    case "escalateToHuman": {
      const reason = args.reason || "Запит клієнта";
      if (context.onEscalate) {
        await context.onEscalate(reason);
      }
      return JSON.stringify({
        escalated: true,
        message: "Діалог успішно переведено на чергового оператора підтримки. AI авто-відповідач тимчасово призупинено.",
      });
    }

    default:
      return JSON.stringify({ error: `Невідомий інструмент: ${toolName}` });
  }
}
