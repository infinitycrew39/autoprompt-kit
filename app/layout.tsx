import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoPrompt Kit 2026 | Premium Prompt Packs for Autonomous AI Agents",
  description:
    "AutoPrompt Kit 2026 is a premium digital product with battle-tested prompt packs for Hermes, Nemotron, Claude, Cursor, Grok, and more.",
  metadataBase: new URL("https://autoprompt-kit-2026.vercel.app"),
  openGraph: {
    title: "AutoPrompt Kit 2026",
    description:
      "Unlock the full power of autonomous AI agents with premium prompt packs.",
    url: "https://autoprompt-kit-2026.vercel.app",
    siteName: "AutoPrompt Kit 2026",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AutoPrompt Kit 2026",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoPrompt Kit 2026",
    description:
      "Premium prompt packs for autonomous AI systems with production-grade templates.",
    images: ["/opengraph-image"],
  },
  keywords: [
    "autonomous ai agents",
    "prompt pack",
    "digital product",
    "stripe checkout",
    "hermes prompt",
    "nemotron prompt",
    "claude prompt",
    "cursor prompt",
    "grok prompt",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#0A1428] text-slate-50">{children}</body>
    </html>
  );
}
