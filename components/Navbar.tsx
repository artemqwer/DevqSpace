import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 glass border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          <Link
            href="/"
            className="flex-shrink-0 flex items-center cursor-pointer group"
          >
            <i
              className="ph-fill ph-code text-neon-blue text-2xl md:text-3xl mr-2 group-hover:animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <span className="font-display font-bold text-xl md:text-2xl tracking-tighter text-white">
              NEXUS<span className="text-neon-blue">.</span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center border border-white/10 rounded-full px-6 py-2 bg-black/40 backdrop-blur-md">
            <Link
              href="/catalog"
              className="text-gray-400 hover:text-white font-medium text-sm transition-colors uppercase tracking-wider"
            >
              Каталог
            </Link>
            <Link
              href="/custom"
              className="text-gray-400 hover:text-white font-medium text-sm transition-colors uppercase tracking-wider"
            >
              Кастом
            </Link>
            <Link
              href="/cases"
              className="text-gray-400 hover:text-white font-medium text-sm transition-colors uppercase tracking-wider"
            >
              Кейси
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/about"
              className="text-gray-300 hover:text-white font-display font-medium px-4 py-2 transition-colors"
            >
              Про нас
            </Link>
            <Link
              href="/custom"
              className="relative group overflow-hidden rounded-md px-6 py-2 font-display font-bold text-black bg-neon-blue transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <i className="ph-bold ph-paper-plane-tilt" /> Замовити
              </span>
              <div className="absolute inset-0 h-full w-full bg-white/20 scale-0 group-hover:scale-100 transition-transform origin-center rounded-md" />
            </Link>
          </div>

          {/* Mobile: compact CTA pill */}
          <Link
            href="/custom"
            className="md:hidden flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-bold text-xs text-black bg-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.35)]"
          >
            <i className="ph-bold ph-paper-plane-tilt text-sm" />
            Замовити
          </Link>
        </div>
      </div>
    </nav>
  );
}
