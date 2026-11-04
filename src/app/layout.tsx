import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono, Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Interfeys uchun Inter, post matni uchun Source Serif. Postlardagi ruscha so'zlar uchun kirill ham kerak
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin", "cyrillic"], variable: "--font-source-serif" });
// Sarlavhalar, bosh sahifadagi katta yozuv va sana/teg/tugma yozuvlari. Kirill harflari bo'lmasa Inter'ga o'tiladi
const schibsted = Schibsted_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-schibsted" });
const anton = Anton({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-anton" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-jetbrains" });

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
    <html lang="uz" className={`${inter.variable} ${sourceSerif.variable} ${schibsted.variable} ${anton.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-background text-white">{children}</body>
    </html>
  );
}
