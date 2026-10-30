import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SubscribeModal from "@/components/SubscribeModal";

// Interfeys uchun Inter, post matni uchun Source Serif. Postlardagi ruscha so'zlar uchun kirill ham kerak
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin", "cyrillic"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  // Netlify build paytida URL o'zgaruvchisiga saytning asosiy manzilini beradi
  metadataBase: new URL(process.env.URL ?? "http://localhost:3000"),
  title: {
    default: "Kamalovic's Blog",
    template: "%s | Kamalovic's Blog",
  },
  description: "Dasturlash, Linux va texnologiyalar haqida maqolalar",
  openGraph: {
    type: "website",
    siteName: "Kamalovic's Blog",
    locale: "uz_UZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="antialiased bg-background text-white">
        <nav className="py-4 sm:py-6 border-b border-gray-700/50">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex justify-between items-center gap-4">
            <Link href="/" className="text-xl sm:text-2xl font-extrabold tracking-tighter cursor-pointer">Kamalovic&apos;s Blog</Link>
            <div className="flex items-center">
              <SubscribeModal />
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12">{children}</main>
        <footer className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12 border-t border-gray-700/50 text-center flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
          <a href="https://github.com/kamalovicdev-sys" target="_blank" className="text-gray-400 hover:text-white transition">GitHub</a>
          <a href="https://t.me/kama1ovic" target="_blank" className="text-gray-400 hover:text-white transition">Telegram</a>
          <a href="https://kamalovic.netlify.app" target="_blank" className="text-gray-400 hover:text-white transition">Portfolio</a>
        </footer>
      </body>
    </html>
  );
}
