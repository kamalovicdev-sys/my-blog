import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

// Ildiz layout'da header/footer yo'q, shuning uchun 404 sahifasi ularni o'zi qo'shadi
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12">
        <section className="text-center py-16">
          <p className="text-6xl font-extrabold text-gray-600">404</p>
          <h1 className="text-2xl font-bold mt-4">Page not found</h1>
          <p className="text-gray-400 mt-2">This post may have been moved or removed.</p>
          <Link href="/" className="inline-block mt-8 px-6 py-2 bg-white text-background rounded-lg font-bold hover:bg-gray-200 transition">
            Back to all posts
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
