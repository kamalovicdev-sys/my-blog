"use client";
import { useState } from "react";
import Link from 'next/link';

interface Post {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

export default function PostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = initialPosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search posts..."
          className="w-full bg-[#1e2a38] text-white px-5 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-white transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="space-y-8">
        {filteredPosts.map(({ id, date, title, description, imageUrl }) => (
          <Link key={id} href={`/posts/${id}`} className="block group">
            <article className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start border-b border-gray-700/50 pb-8">
              <div className="flex-1 order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">{date}</p>
                <h2 className="text-xl sm:text-2xl font-extrabold mb-1 sm:mb-2 group-hover:text-gray-300">{title}</h2>
                <p className="text-sm sm:text-base text-gray-400">{description}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium text-[#4F46E5] hover:underline">
                    Click to read more →
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-32 h-40 sm:h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden order-1 sm:order-2">
                <img 
                  src={imageUrl || `https://picsum.photos/seed/${id}/400/300`} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}
