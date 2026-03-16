import { getSortedPostsData } from "../lib/posts";
import PostsClient from "../components/PostsClient";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <section>
      <PostsClient initialPosts={allPostsData} />
    </section>
  );
}
