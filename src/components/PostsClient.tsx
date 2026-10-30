"use client";
import { useState } from "react";
import PostCard from "@/components/PostCard";
import TagLink from "@/components/TagLink";
import type { PostMeta, Tag } from "@/lib/posts";

export default function PostsClient({ initialPosts, tags }: { initialPosts: PostMeta[]; tags: Tag[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.toLowerCase();
  const filteredPosts = initialPosts.filter((post) =>
    post.title.toLowerCase().includes(query) ||
    post.tags.some((tag) => tag.name.toLowerCase().includes(query))
  );

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          className="w-full bg-surface text-white px-5 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-white transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {tags.length > 0 && (
        // Mobilda teglar bir qatorda yonga suriladi, kattaroq ekranda qatorlarga bo'linadi
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-8">
          {tags.map((tag) => <TagLink key={tag.slug} tag={tag} />)}
        </div>
      )}
      <div className="space-y-6 sm:space-y-8">
        {filteredPosts.map((post) => <PostCard key={post.slug} post={post} />)}
        {filteredPosts.length === 0 && (
          <p className="text-gray-400 text-center py-12">No posts found</p>
        )}
      </div>
    </>
  );
}
