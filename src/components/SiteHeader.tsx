import Link from "next/link";
import Logo from "@/components/Logo";
import SubscribeModal from "@/components/SubscribeModal";

export default function SiteHeader() {
  return (
    <nav className="py-4 sm:py-6 border-b border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-wider max-[359px]:text-base max-[359px]:tracking-normal">
          <Logo />
        </Link>
        <div className="flex items-center">
          <SubscribeModal />
        </div>
      </div>
    </nav>
  );
}
