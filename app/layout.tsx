import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono-space",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "NEXUS | Digital Goods Marketplace",
  description:
    "Елітний маркетплейс цифрових артефактів. Купуй та продавай Telegram-боти, смарт-контракти, скрипти та UI-кіти нового покоління.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} dark scroll-smooth`}
    >
      <body className="custom-scrollbar font-sans antialiased selection:bg-neon-blue selection:text-black">
        {children}
      </body>
    </html>
  );
}
