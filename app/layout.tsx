import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { WelcomeSheet } from "@/components/site/WelcomeSheet";
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
  metadataBase: new URL("https://devq.space"),
  title: {
    default: "DevqSpace — цифрова студія: готові продукти та розробка під ключ",
    template: "%s | DevqSpace",
  },
  description:
    "DevqSpace — студія цифрових продуктів. Готові Telegram-боти, веб-додатки, скрипти, Web3-рішення та шаблони з повним сорс-кодом. Або кастомна розробка під ключ із гарантією на рік.",
  keywords: [
    "Telegram боти",
    "веб-додатки",
    "SaaS",
    "Web3",
    "смарт-контракти",
    "скрипти автоматизації",
    "готові рішення",
    "розробка під ключ",
    "цифрові продукти",
    "сорс-код",
    "DevqSpace",
    "devq.space",
  ],
  applicationName: "DevqSpace",
  authors: [{ name: "DevqSpace" }],
  creator: "DevqSpace",
  publisher: "DevqSpace",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "https://devq.space",
    siteName: "DevqSpace",
    title: "DevqSpace — готові цифрові продукти та розробка під ключ",
    description:
      "Telegram-боти, веб-додатки, Web3 і шаблони з повним сорс-кодом. Гарантія 1 рік, оплата картою чи криптою.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevqSpace — готові цифрові продукти та розробка під ключ",
    description:
      "Telegram-боти, веб-додатки, Web3 і шаблони з сорс-кодом. Гарантія 1 рік.",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
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
        <WelcomeSheet />
      </body>
    </html>
  );
}
