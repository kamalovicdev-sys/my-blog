import { redirect } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { emptyPostForm } from "@/lib/admin/post-file";
import { collectSeries, collectTags, listPosts } from "@/lib/admin/posts";
import { getAdminSession } from "@/lib/admin/session";

export default async function NewPostPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  // Teg va seriya takliflari bo'lmasa ham muharrir ochilaversin
  const rows = await listPosts(session.accessToken).catch(() => []);
  return <PostEditor initial={emptyPostForm()} tagSuggestions={collectTags(rows)} seriesSuggestions={collectSeries(rows)} />;
}
