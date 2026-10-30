"use client";
import { useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { formatDate } from "@/lib/date";

interface Post {
  slug: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string | null;
  draft: boolean;
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
          className="w-full bg-surface text-white px-5 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-white transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="space-y-6 sm:space-y-8">
        {filteredPosts.map(({ slug, date, title, description, imageUrl, draft }) => (
          <Link key={slug} href={`/posts/${slug}`} className="block group">
            <article className="flex gap-4 sm:gap-6 items-start border-b border-gray-700/50 pb-6 sm:pb-8">
              <div className="flex-1 min-w-0">
                <time dateTime={date} className="block text-xs text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
                  {formatDate(date)}
                  {draft && <span className="ml-2 text-amber-400">· Qoralama</span>}
                </time>
                <h2 className="text-lg sm:text-2xl font-extrabold leading-snug mb-1 sm:mb-2 group-hover:text-gray-300">{title}</h2>
                <p className="text-sm sm:text-base text-gray-400 line-clamp-2 sm:line-clamp-3">{description}</p>
              </div>
              {imageUrl && (
                <div className="relative w-20 h-14 sm:w-36 sm:h-24 flex-shrink-0 bg-surface rounded-md sm:rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(min-width: 640px) 144px, 80px"
                    // Tashqi saytlardagi rasmlar next.config'da ruxsat etilmagan, ular o'zgarishsiz ko'rsatiladi
                    unoptimized={!imageUrl.startsWith("/")}
                    className="object-cover"
                  />
                </div>
              )}
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}
