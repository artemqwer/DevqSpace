import { ImageResponse } from "next/og";

// Генеративне прев'ю для соцмереж (Open Graph / Twitter). Рендериться
// Next-ом на льоту — брендований неоновий банер DevqSpace.

export const alt = "DevqSpace — цифрова студія: готові продукти та розробка під ключ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(1000px 500px at 15% 0%, rgba(0,240,255,0.18), transparent 55%), radial-gradient(900px 500px at 100% 100%, rgba(138,43,226,0.22), transparent 55%), linear-gradient(135deg, #08080f 0%, #050509 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* technical grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "9999px",
              background: "#00ff88",
              boxShadow: "0 0 24px #00ff88",
              display: "flex",
            }}
          />
          <div
            style={{
              color: "#8b93a7",
              fontSize: "26px",
              letterSpacing: "6px",
              fontWeight: 600,
            }}
          >
            SYS.ONLINE // ВЕРИФІКОВАНІ ЦИФРОВІ ПРОДУКТИ
          </div>
        </div>

        {/* wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", fontSize: "150px", fontWeight: 800, letterSpacing: "-4px" }}>
            <span style={{ color: "#00f0ff" }}>Devq</span>
            <span style={{ color: "#b98cff" }}>Space</span>
          </div>
          <div style={{ color: "#c7cdd9", fontSize: "40px", fontWeight: 500, maxWidth: "900px", lineHeight: 1.25 }}>
            Готові Telegram-боти, веб-додатки та Web3 — з сорс-кодом. Або розробка під ключ.
          </div>
        </div>

        {/* bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "14px" }}>
            {["Гарантія 1 рік", "Повний сорс-код", "Крипта / картка"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "9999px",
                  padding: "12px 24px",
                  color: "#c7cdd9",
                  fontSize: "26px",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ color: "#00f0ff", fontSize: "30px", fontWeight: 700, display: "flex" }}>
            devq.space
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
