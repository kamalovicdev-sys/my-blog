import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin sahifalari har so'rovda sessiyani tekshiradi, build paytida statik HTML'ga aylanmasligi kerak
export const dynamic = "force-dynamic";

// Har bir sahifa o'z tepa panelini chizadi: ro'yxatda AdminHeader, muharrirda yozish paneli
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">{children}</div>;
}
