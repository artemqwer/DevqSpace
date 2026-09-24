import { getSession } from "@/lib/session";
import { getSupportSettings } from "@/lib/support/store";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const current = await getSupportSettings();

    const provider = body.provider || current.provider || "google";
    const baseUrl = body.baseUrl || current.baseUrl;
    let apiKey = body.apiKey?.trim();

    // If apiKey is masked or empty, use saved apiKey
    if (!apiKey || apiKey.includes("••••")) {
      apiKey = current.apiKey;
    }

    if (!apiKey) {
      return Response.json(
        {
          ok: false,
          error: "Будь ласка, введіть або збережіть API ключ перед опитуванням списку моделей.",
        },
        { status: 400, headers: NO_CACHE_HEADERS },
      );
    }

    const isGoogle =
      provider === "google" ||
      apiKey.startsWith("AIza") ||
      baseUrl?.includes("generativelanguage.googleapis.com");

    if (isGoogle) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      let res: Response;
      try {
        res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      } catch (e: any) {
        return Response.json(
          {
            ok: false,
            error: `Помилка з'єднання з Google API: ${e.message}`,
          },
          { status: 504, headers: NO_CACHE_HEADERS },
        );
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let message = `Google API повернув статус HTTP ${res.status}`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed?.error?.message) {
            message = parsed.error.message;
          }
        } catch {}
        return Response.json(
          { ok: false, error: message },
          { status: res.status, headers: NO_CACHE_HEADERS },
        );
      }

      const data = await res.json();
      if (!Array.isArray(data.models)) {
        return Response.json(
          { ok: false, error: "Не знайдено масиву моделей у відповіді Google" },
          { status: 500, headers: NO_CACHE_HEADERS },
        );
      }

      // Filter only models that support generateContent
      const models = data.models
        .filter((m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent"),
        )
        .map((m: any) => ({
          id: m.name.replace(/^models\//, ""),
          name: m.displayName || m.name.replace(/^models\//, ""),
          description: m.description || "",
        }))
        // Prioritize modern flash models, then pro, then experimental
        .sort((a: any, b: any) => {
          const rank = (id: string) => {
            if (id === "gemini-2.0-flash") return 1;
            if (id.includes("2.0-flash")) return 2;
            if (id === "gemini-1.5-flash") return 3;
            if (id.includes("1.5-flash-8b")) return 4;
            if (id.includes("1.5-flash")) return 5;
            if (id.includes("1.5-pro")) return 6;
            if (id.includes("2.0-pro")) return 7;
            if (id.includes("flash")) return 8;
            return 20;
          };
          return rank(a.id) - rank(b.id);
        });

      return Response.json(
        { ok: true, provider: "google", models },
        { headers: NO_CACHE_HEADERS },
      );
    }

    // OpenAI-compatible providers (OpenAI, DeepSeek, OpenRouter, Groq, custom)
    const base = baseUrl ? baseUrl.replace(/\/$/, "") : "https://api.openai.com/v1";
    const modelsUrl = `${base}/models`;

    let res: Response;
    try {
      res = await fetch(modelsUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(12000),
      });
    } catch (e: any) {
      return Response.json(
        {
          ok: false,
          error: `Помилка з'єднання з API провайдера: ${e.message}`,
        },
        { status: 504, headers: NO_CACHE_HEADERS },
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      let message = `API повернув помилку HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {}
      return Response.json(
        { ok: false, error: message },
        { status: res.status, headers: NO_CACHE_HEADERS },
      );
    }

    const data = await res.json();
    const list = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.models)
        ? data.models
        : [];
    const models = list.map((m: any) => ({
      id: m.id || m.name,
      name: m.id || m.name,
      description: m.description || "",
    }));

    return Response.json(
      { ok: true, provider, models },
      { headers: NO_CACHE_HEADERS },
    );
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e.message || "Внутрішня помилка сервера" },
      { status: 500, headers: NO_CACHE_HEADERS },
    );
  }
}
