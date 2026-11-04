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
      {/* Kenglikni har bir sahifa o'zi belgilaydi: bosh sahifa keng, post sahifasi tor */}
      <main>{children}</main>
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
