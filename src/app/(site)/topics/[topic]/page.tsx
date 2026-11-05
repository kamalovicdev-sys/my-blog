import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stream from "@/components/Stream";
import { getAllTopics, getPostsByTopic, getTopic } from "@/lib/posts";
import { pageAlternates } from "@/lib/site";

type Props = { params: Promise<{ topic: string }> };

// Mavzular src/lib/topics.ts'da, sahifalar build paytida yasaladi
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTopics()
    .filter((topic) => topic.count > 0)
    .map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = getTopic((await params).topic);
  if (!topic) return {};
  return { title: topic.name, description: topic.description, alternates: pageAlternates(`/topics/${topic.slug}`) };
}

export default async function TopicPage({ params }: Props) {
  const topic = getTopic((await params).topic);
  const posts = topic ? getPostsByTopic(topic.slug) : [];
  if (!topic || posts.length === 0) notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted transition hover:text-white">← All posts</Link>
      <h1 className="mt-5 font-display text-[clamp(52px,10vw,96px)] font-normal uppercase leading-[0.9]">{topic.name}</h1>
      <p className="mt-3 text-lg text-muted">
        <span aria-hidden="true" className="text-violet">/</span> {topic.description}{" "}
        <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-faint">· {posts.length} {posts.length === 1 ? "post" : "posts"}</span>
      </p>
      <div className="mt-4">
        <Stream posts={posts} controls={false} />
      </div>
    </section>
  );
}
