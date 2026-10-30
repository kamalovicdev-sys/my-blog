import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostData, getPostMeta } from "@/lib/posts";
import ShareButtons from "@/components/ShareButtons";

type Props = { params: Promise<{ slug: string }> };

// Postlar build paytida tayyorlanadi, src/posts'da yo'q manzillar 404 qaytaradi
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

  const styledContent = postData.contentHtml.replace(
    /<img/g,
    '<img class="block w-full max-w-2xl mx-auto rounded-lg shadow-lg my-8"'
  );

  return (
    <article className="max-w-2xl mx-auto py-10 px-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest">{postData.date}</p>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-8 text-white">{postData.title}</h1>
      <div
        className="prose prose-invert prose-stone max-w-none"
        dangerouslySetInnerHTML={{ __html: styledContent }}
      />
      <ShareButtons slug={slug} />
    </article>
  );
}
