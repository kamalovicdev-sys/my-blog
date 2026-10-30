import Link from "next/link";

export default function NotFound() {
  return (
    <section className="text-center py-16">
      <p className="text-6xl font-extrabold text-gray-600">404</p>
      <h1 className="text-2xl font-bold mt-4">Page not found</h1>
      <p className="text-gray-400 mt-2">This post may have been moved or removed.</p>
      <Link href="/" className="inline-block mt-8 px-6 py-2 bg-white text-background rounded-lg font-bold hover:bg-gray-200 transition">
        Back to all posts
      </Link>
    </section>
  );
}
