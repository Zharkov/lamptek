import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Display — геометрический, энергичный, полная кириллица. Используется сдержанно.
const display = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["600", "800"], variable: "--font-display" });
// Body — чистый, кириллица.
const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body" });
// Mono — для значений характеристик, как в даташите.
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LampTek — светодиодное освещение для промышленности и города",
  description:
    "Производство светодиодных светильников: уличное, промышленное, офисное освещение, прожекторы, ЖКХ. Расчёт проекта под задачу.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
