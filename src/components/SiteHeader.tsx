import { Fragment } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Logo from "@/components/Logo";
import SubscribeModal from "@/components/SubscribeModal";
import { SOCIAL } from "@/lib/site";

const NAV = [
  { label: "Latest", href: "/" },
  { label: "Topics", href: "/#topics" },
  { label: "About", href: SOCIAL.portfolio },
];

// The Verge uslubidagi menyu: bo'limlar "/" bilan ajratiladi. Telefonda faqat logo, qidiruv va Subscribe
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
        {NAV.map(({ label, href }) => (
          <Fragment key={label}>
            <span aria-hidden="true" className="text-[#5a6a7e] max-sm:hidden">/</span>
            <Link href={href} className="underline-offset-4 hover:underline max-sm:hidden">
              {label}
            </Link>
          </Fragment>
        ))}
        <span aria-hidden="true" className="text-[#5a6a7e] max-sm:hidden">/</span>
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
