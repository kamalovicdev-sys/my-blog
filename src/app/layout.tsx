import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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

// Faqat umumiy qobiq: blog sahifalari (site) layout'ida, admin panel esa admin/ layout'ida
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="antialiased bg-background text-white">{children}</body>
    </html>
  );
}
