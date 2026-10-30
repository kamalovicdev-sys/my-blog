import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostData, getPostMeta, getRelatedPosts } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import CodeCopyButtons from "@/components/CodeCopyButtons";
import Comments from "@/components/Comments";
import PostCard, { PostInfo } from "@/components/PostCard";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import TableOfContents from "@/components/TableOfContents";
import TagLink from "@/components/TagLink";

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
      siteName: SITE_NAME,
      locale: "uz_UZ",
      title: post.title,
      description: post.description,
      url: `/posts/${slug}`,
      publishedTime: post.date,
      tags: post.tags.map((tag) => tag.name),
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const postData = await getPostData(slug);
  if (!postData) notFound();

  const relatedPosts = getRelatedPosts(slug);
  // Mundarija faqat bir nechta bo'limli postlarda kerak
  const showToc = postData.toc.length >= 3;

  return (
    <>
      <ReadingProgress />
      <CodeCopyButtons />
      <article className="relative max-w-2xl mx-auto">
        <header className="mb-8 sm:mb-10">
          <PostInfo {...postData} />
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-balance mt-2 text-white">{postData.title}</h1>
        </header>

        {showToc && (
          <>
            <details className="xl:hidden mb-8 rounded-lg border border-gray-700/50 bg-surface px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-gray-300">Contents</summary>
              <div className="mt-3">
                <TableOfContents items={postData.toc} />
              </div>
            </details>
            <aside className="hidden xl:block absolute top-0 left-full ml-12 w-56 h-full">
              <nav className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Contents</p>
                <TableOfContents items={postData.toc} />
              </nav>
            </aside>
          </>
        )}

        <div
          className="prose prose-lg prose-invert prose-slate max-w-none break-words font-serif prose-headings:font-sans prose-h2:text-2xl prose-h3:text-xl prose-img:mx-auto prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />

        {postData.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {postData.tags.map((tag) => <TagLink key={tag.slug} tag={tag} />)}
          </div>
        )}
        <ShareButtons url={`${SITE_URL}/posts/${slug}`} title={postData.title} />
        <Comments />
      </article>

      {relatedPosts.length > 0 && (
        <section className="max-w-2xl mx-auto mt-16">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Read next</h2>
          <div className="space-y-6 sm:space-y-8">
            {relatedPosts.map((post) => <PostCard key={post.slug} post={post} />)}
          </div>
        </section>
      )}
    </>
  );
}
