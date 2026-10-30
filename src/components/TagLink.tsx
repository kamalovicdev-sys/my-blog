import Link from "next/link";
import type { Tag } from "@/lib/posts";

export default function TagLink({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="shrink-0 rounded-full bg-surface border border-gray-700 px-3 py-1 text-sm text-gray-300 hover:border-white hover:text-white transition"
    >
      #{tag.name}
    </Link>
  );
}
