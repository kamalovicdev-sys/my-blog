import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut, Plus } from "lucide-react";
import Logo from "@/components/Logo";

const ICON_BUTTON = "flex size-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition";

export default function AdminHeader({ login }: { login: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-700/50 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold tracking-wider">
          <Logo />
          <span className="ml-1 hidden rounded border border-gray-700 bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 sm:inline">
            Admin
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/admin/new" className="mr-1 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-background hover:bg-gray-200 transition">
            <Plus className="size-4" strokeWidth={2.5} />
            New post
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" title="View site" aria-label="View site" className={`${ICON_BUTTON} max-sm:hidden`}>
            <ExternalLink className="size-[18px]" />
          </a>
          <Image
            src={`https://github.com/${login}.png?size=64`}
            alt=""
            title={`Signed in as ${login}`}
            width={28}
            height={28}
            unoptimized
            className="mx-1 hidden rounded-full ring-1 ring-gray-700 sm:block"
          />
          <form action="/admin/logout" method="post">
            <button title="Sign out" aria-label="Sign out" className={ICON_BUTTON}>
              <LogOut className="size-[18px]" />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
