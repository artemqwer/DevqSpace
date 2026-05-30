import { CATEGORIES, type Product } from "@/lib/products";

type Props = {
  product: Product;
  className?: string;
  iconClassName?: string;
  rounded?: string;
};

const GRADIENTS: Record<Product["accent"], string> = {
  blue: "from-[#0f1f2e] via-[#0a1828] to-[#0a0a14]",
  purple: "from-[#1f0f2e] via-[#1a0a28] to-[#0a0a14]",
  pink: "from-[#2e0f1f] via-[#28091a] to-[#14080a]",
  green: "from-[#0f2e1f] via-[#0a281a] to-[#0a140a]",
};

const ICON_GLOW: Record<Product["accent"], string> = {
  blue: "text-neon-blue drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]",
  purple: "text-neon-purple drop-shadow-[0_0_20px_rgba(138,43,226,0.4)]",
  pink: "text-neon-pink drop-shadow-[0_0_20px_rgba(255,0,127,0.4)]",
  green: "text-neon-green drop-shadow-[0_0_20px_rgba(0,255,102,0.4)]",
};

export default function ProductThumb({
  product,
  className = "",
  iconClassName = "text-5xl",
  rounded = "",
}: Props) {
  const category = CATEGORIES.find((c) => c.id === product.category);
  const icon = category?.icon ?? "ph-cube";

  // Якщо є реальне зображення — показуємо його замість градієнта
  if (product.image) {
    return (
      <div
        className={`relative overflow-hidden bg-surface2 ${rounded} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${GRADIENTS[product.accent]} ${rounded} ${className}`}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Glow blob */}
      <div
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-50 ${ICON_GLOW[product.accent].split(" ")[0].replace("text-", "bg-")}`}
      />

      {/* Centered icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <i className={`ph ${icon} ${ICON_GLOW[product.accent]} ${iconClassName}`} />
      </div>

      {/* Slug watermark */}
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/20 tracking-wider">
        {product.slug}
      </div>
    </div>
  );
}
