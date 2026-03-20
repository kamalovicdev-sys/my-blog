import type { Metadata } from "next";
import "./globals.css";
import SubscribeModal from "@/components/SubscribeModal";

export const metadata: Metadata = {
  title: "Kamalovic's Blog",
  description: "A Substack-style blog built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#17212d] text-white">
        <nav className="py-6 border-b border-gray-700/50">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex justify-between items-center">
            <a href="/" className="text-xl sm:text-2xl font-extrabold tracking-tighter cursor-pointer">Kamalovic's Blog</a>
            <div className="flex items-center">
              <SubscribeModal />
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12">{children}</main>
        <footer className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12 border-t border-gray-700/50 text-center flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm">
          <a href="https://github.com/kamalovicdev-sys" target="_blank" className="text-gray-400 hover:text-white transition">GitHub</a>
          <a href="https://t.me/kama1ovic" target="_blank" className="text-gray-400 hover:text-white transition">Telegram</a>
          <a href="https://kamalovic.netlify.app" target="_blank" className="text-gray-400 hover:text-white transition">Portfolio</a>
        </footer>
      </body>
    </html>
  );
}
