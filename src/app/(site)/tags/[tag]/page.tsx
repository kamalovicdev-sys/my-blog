import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stream from "@/components/Stream";
import { getAllTags, getPostsByTag } from "@/lib/posts";

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
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted transition hover:text-white">← All posts</Link>
      <h1 className="mt-5 break-words font-display text-[clamp(52px,10vw,96px)] font-normal leading-[0.9]">#{tag.name}</h1>
      <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-faint">{tag.count} {tag.count === 1 ? "post" : "posts"}</p>
      <div className="mt-4">
        <Stream posts={getPostsByTag(tag.slug)} controls={false} />
      </div>
    </section>
  );
}
