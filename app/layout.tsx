import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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
    default: "DevqSpace — Digital Studio: Ready-Made Products & Custom Development",
    template: "%s | DevqSpace",
  },
  description:
    "DevqSpace — a digital product studio. Ready-made Telegram bots, web apps, scripts, Web3 solutions and templates with full source code. Or custom turnkey development with a one-year warranty.",
  keywords: [
    "Telegram bots",
    "web apps",
    "SaaS",
    "Web3",
    "smart contracts",
    "automation scripts",
    "ready-made solutions",
    "turnkey development",
    "digital products",
    "source code",
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
    locale: "en_US",
    url: "https://devq.space",
    siteName: "DevqSpace",
    title: "DevqSpace — Ready-Made Digital Products & Custom Development",
    description:
      "Telegram bots, web apps, Web3 and templates with full source code. 1-year warranty, pay by card or crypto.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevqSpace — Ready-Made Digital Products & Custom Development",
    description:
      "Telegram bots, web apps, Web3 and templates with source code. 1-year warranty.",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} dark scroll-smooth`}
    >
      <body className="custom-scrollbar font-sans antialiased selection:bg-neon-blue selection:text-black">
        <NextIntlClientProvider messages={messages}>
          {children}
          <WelcomeSheet />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
