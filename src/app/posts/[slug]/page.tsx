import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostData, getPostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/date";
import ShareButtons from "@/components/ShareButtons";

type Props = { params: Promise<{ slug: string }> };

// Postlar build paytida tayyorlanadi, content/posts'da yo'q manzillar 404 qaytaradi
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      siteName: "Kamalovic's Blog",
      locale: "uz_UZ",
      title: post.title,
      description: post.description,
      url: `/posts/${slug}`,
      publishedTime: post.date,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const postData = await getPostData(slug);
  if (!postData) notFound();

  return (
    <article className="max-w-2xl mx-auto">
      <header className="mb-8 sm:mb-10">
        <time dateTime={postData.date} className="text-xs text-gray-400 uppercase tracking-widest">
          {formatDate(postData.date)}
        </time>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-balance mt-2 text-white">{postData.title}</h1>
      </header>
      <div
        className="prose prose-lg prose-invert prose-slate max-w-none break-words font-serif prose-headings:font-sans prose-h2:text-2xl prose-h3:text-xl prose-img:mx-auto prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
      <ShareButtons slug={slug} />
    </article>
  );
}
