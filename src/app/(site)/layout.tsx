import Script from "next/script";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CLOUDFLARE_ANALYTICS_TOKEN } from "@/lib/site";

// Blog sahifalari. Admin panelning o'z layout'i bor va statistikaga kirmaydi
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12">{children}</main>
      <SiteFooter />
      {CLOUDFLARE_ANALYTICS_TOKEN && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN })}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
