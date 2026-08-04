import {
  TelegramLogo,
  Browsers,
  DeviceMobile,
  Lightning,
  CurrencyEth,
  Layout,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { Accent, CategoryId, Product } from "@/lib/products";

// Генеративна преміум-обкладинка товару: темна база + неонові орби під
// акцент, технічна сітка, хвильовий mesh, світна іконка категорії й
// mono-вотермарк. Детермінована по slug — той самий товар завжди однаковий.

const PALETTE: Record<Accent, [string, string]> = {
  blue: ["#00f0ff", "#7c3aed"],
  purple: ["#8a2be2", "#00e5ff"],
  pink: ["#ff2d78", "#8a2be2"],
  green: ["#00ff88", "#00e5ff"],
};

const CATEGORY: Record<
  CategoryId,
  { icon: ComponentType<IconProps>; code: string }
> = {
  "telegram-bots": { icon: TelegramLogo, code: "TG" },
  web: { icon: Browsers, code: "WEB" },
  mobile: { icon: DeviceMobile, code: "APP" },
  automation: { icon: Lightning, code: "AUTO" },
  web3: { icon: CurrencyEth, code: "W3" },
  templates: { icon: Layout, code: "UI" },
};

function seed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function ProductCover({
  product,
  className = "",
  size = "card",
}: {
  product: Product;
  className?: string;
  size?: "card" | "hero";
}) {
  // Реальне зображення — показуємо його поверх.
  if (product.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    );
  }

  const [c1, c2] = PALETTE[product.accent] ?? PALETTE.blue;
  const { icon: Icon, code } = CATEGORY[product.category] ?? CATEGORY.web;
  const h = seed(product.slug);
  const flip = h % 2 === 0;
  const orb1 = 12 + (h % 24); // %
  const orb2 = 60 + ((h >> 3) % 28);
  const hero = size === "hero";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(120% 130% at 18% 12%, rgba(255,255,255,0.05), transparent 55%), linear-gradient(150deg, #0b0b12 0%, #070709 60%, #05050a 100%)",
      }}
    >
      {/* accent glow orbs */}
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          background: c1,
          opacity: 0.5,
          width: hero ? "42%" : "70%",
          aspectRatio: "1",
          left: `${orb1}%`,
          top: flip ? "-18%" : "auto",
          bottom: flip ? "auto" : "-24%",
        }}
        aria-hidden
      />
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          background: c2,
          opacity: 0.38,
          width: hero ? "34%" : "55%",
          aspectRatio: "1",
          left: `${orb2}%`,
          top: flip ? "48%" : "-10%",
        }}
        aria-hidden
      />

      {/* technical grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: hero ? "44px 44px" : "26px 26px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #000 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #000 30%, transparent 78%)",
        }}
        aria-hidden
      />

      {/* wave mesh */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 h-[70%] w-full opacity-40"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        style={{ transform: flip ? "scaleX(-1)" : undefined }}
      >
        <defs>
          <linearGradient id={`mesh-${code}-${product.accent}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} stopOpacity="0" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {Array.from({ length: 7 }).map((_, r) => (
          <path
            key={r}
            d={`M0 ${80 + r * 18} Q 130 ${40 + r * 18} 250 ${100 + r * 14} T 400 ${70 + r * 16}`}
            stroke={`url(#mesh-${code}-${product.accent})`}
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>

      {/* watermark code */}
      <span
        className="pointer-events-none absolute select-none font-display font-bold uppercase leading-none"
        style={{
          right: hero ? "4%" : "-2%",
          bottom: hero ? "-6%" : "-12%",
          fontSize: hero ? "9rem" : "4.5rem",
          color: "rgba(255,255,255,0.05)",
          letterSpacing: "-0.04em",
        }}
        aria-hidden
      >
        {code}
      </span>

      {/* category icon */}
      <div className="absolute inset-0 grid place-items-center">
        <Icon
          weight="duotone"
          className="text-white/90"
          style={{
            width: hero ? "5.5rem" : "2.75rem",
            height: hero ? "5.5rem" : "2.75rem",
            filter: `drop-shadow(0 0 18px ${c1}) drop-shadow(0 0 40px ${c2}88)`,
          }}
        />
      </div>

      {/* gloss + vignette */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
    </div>
  );
}
