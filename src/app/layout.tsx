import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import SubscribeModal from "@/components/SubscribeModal";
import { CLOUDFLARE_ANALYTICS_TOKEN, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";

// Interfeys uchun Inter, post matni uchun Source Serif. Postlardagi ruscha so'zlar uchun kirill ham kerak
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin", "cyrillic"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "uz_UZ",
  },
};

const footerLinks = [
  { label: "GitHub", href: SOCIAL.github },
  { label: "Telegram", href: SOCIAL.telegram },
  { label: "Portfolio", href: SOCIAL.portfolio },
];

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
          {footerLinks.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">{label}</a>
          ))}
          <a href="/rss.xml" className="text-gray-400 hover:text-white transition">RSS</a>
        </footer>
        {CLOUDFLARE_ANALYTICS_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN })}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
