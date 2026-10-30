import { redirect } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { emptyPostForm } from "@/lib/admin/post-file";
import { getAdminSession } from "@/lib/admin/session";

export default async function NewPostPage() {
  if (!(await getAdminSession())) redirect("/admin");
  return <PostEditor initial={emptyPostForm()} />;
}
