import { redirect } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { emptyPostForm } from "@/lib/admin/post-file";
import { collectTags, listPosts } from "@/lib/admin/posts";
import { getAdminSession } from "@/lib/admin/session";

export default async function NewPostPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  // Teg takliflari bo'lmasa ham muharrir ochilaversin
  const tags = await listPosts(session.accessToken).then(collectTags, () => []);
  return <PostEditor initial={emptyPostForm()} tagSuggestions={tags} />;
}
