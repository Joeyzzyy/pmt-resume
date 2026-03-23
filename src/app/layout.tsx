import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Serif_SC } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://itspmt.com"),
  title: {
    default: "庞梦桐 — 内容运营 · SEO 增长",
    template: "%s | 庞梦桐",
  },
  description:
    "从特斯拉新媒体运营到独立站 SEO 实践，用 maidinhk.com 验证内容驱动增长的方法论。",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable} ${notoSerifSC.variable}`} suppressHydrationWarning data-infinisynapse-extension="true">
      <body className="antialiased" suppressHydrationWarning>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CustomCursor />
      </body>
    </html>
  );
}
