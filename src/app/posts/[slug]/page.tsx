import { getPostData } from "../../../lib/posts";
import ShareButtons from "@/components/ShareButtons";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

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
