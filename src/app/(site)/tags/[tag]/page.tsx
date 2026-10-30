import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostCard from "@/components/PostCard";

type Props = { params: Promise<{ tag: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }));
}

function findTag(slug: string) {
  return getAllTags().find((tag) => tag.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = findTag((await params).tag);
  if (!tag) return {};

  return {
    title: `#${tag.name}`,
    description: `Posts tagged #${tag.name}`,
  };
}

export default async function TagPage({ params }: Props) {
  const tag = findTag((await params).tag);
  if (!tag) notFound();

  return (
    <section>
      <Link href="/" className="text-sm text-gray-400 hover:text-white transition">← All posts</Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold mt-4">#{tag.name}</h1>
      <p className="text-gray-400 mt-1 mb-8">{tag.count} {tag.count === 1 ? "post" : "posts"}</p>
      <div className="space-y-6 sm:space-y-8">
        {getPostsByTag(tag.slug).map((post) => <PostCard key={post.slug} post={post} />)}
      </div>
    </section>
  );
}
