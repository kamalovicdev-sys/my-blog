import { notFound, redirect } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { getFile, GitHubError } from "@/lib/admin/github";
import { isPostFileName, POSTS_DIRECTORY, readPostForm } from "@/lib/admin/post-file";
import { collectSeries, collectTags, listPosts } from "@/lib/admin/posts";
import { getAdminSession } from "@/lib/admin/session";
import { parsePost } from "@/lib/posts";
import { slugify } from "@/lib/slug";

export default async function EditPostPage({ params }: { params: Promise<{ file: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const fileName = decodeURIComponent((await params).file);
  if (!isPostFileName(fileName)) notFound();

  let file, rows;
  try {
    // Teg va seriya takliflari bo'lmasa ham muharrir ochilaversin
    [file, rows] = await Promise.all([
      getFile(session.accessToken, `${POSTS_DIRECTORY}/${fileName}`),
      listPosts(session.accessToken).catch(() => []),
    ]);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) notFound();
    if (error instanceof GitHubError && error.status === 401) redirect("/admin");
    throw error;
  }

  // Frontmatter buzuq bo'lsa ham faylni ochib tuzatish imkoni bo'lsin
  let slug = slugify(fileName.replace(/\.md$/, ""));
  try {
    slug = parsePost(fileName, file.text)?.meta.slug ?? slug;
  } catch {
    // Fayl nomidan yasalgan manzil qoladi
  }

  return <PostEditor key={file.sha} fileName={fileName} sha={file.sha} slug={slug} initial={readPostForm(file.text)} tagSuggestions={collectTags(rows)} seriesSuggestions={collectSeries(rows)} />;
}
