import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getAdminSession } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin sahifalari har so'rovda sessiyani tekshiradi, build paytida statik HTML'ga aylanmasligi kerak
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-700/50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold tracking-wider">
            <Logo />
            <span className="ml-1 hidden sm:inline rounded bg-surface border border-gray-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Admin
            </span>
          </Link>
          {session && (
            <nav className="flex items-center gap-3 sm:gap-5 text-sm whitespace-nowrap">
              <Link href="/admin/new" className="rounded-lg bg-white px-3 py-1.5 font-bold text-background hover:bg-gray-200 transition">
                New post
              </Link>
              <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:inline text-gray-400 hover:text-white transition">
                View site ↗
              </a>
              <form action="/admin/logout" method="post">
                <button className="text-gray-400 hover:text-white transition">Sign out</button>
              </form>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
