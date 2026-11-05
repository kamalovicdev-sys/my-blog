import Link from "next/link";
import { Search } from "lucide-react";
import Logo from "@/components/Logo";
import SubscribeModal from "@/components/SubscribeModal";

// Sayt sarlavhasi: chapda logo (bosh sahifaga olib boradi), o'ngda qidiruv va Subscribe
export default function SiteHeader() {
  return (
    <header className="mx-auto max-w-[1240px] px-4 pt-3 sm:px-6 sm:pt-4">
      <nav aria-label="Main" className="flex items-center gap-x-4 border-b border-line-strong pb-3 text-lg">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-headline text-lg font-extrabold max-[359px]:text-base sm:text-xl"
        >
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/#search" aria-label="Search posts" className="flex size-11 items-center justify-center text-white transition hover:text-violet">
            <Search className="size-5" />
          </Link>
          <SubscribeModal />
        </div>
      </nav>
    </header>
  );
}
