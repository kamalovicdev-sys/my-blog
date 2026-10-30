import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import type { PostMeta } from "@/lib/posts";

// Sana, o'qish vaqti va qoralama belgisi: post kartochkasida ham, post sahifasida ham ishlatiladi
export function PostInfo({ date, readingTime, draft, className = "" }: Pick<PostMeta, "date" | "readingTime" | "draft"> & { className?: string }) {
  return (
    <p className={`text-xs text-gray-400 uppercase tracking-widest ${className}`}>
      <time dateTime={date}>{formatDate(date)}</time>
      {` · ${readingTime} daqiqa`}
      {draft && <span className="text-amber-400"> · Qoralama</span>}
    </p>
  );
}

export default function PostCard({ post }: { post: PostMeta }) {
  const { slug, title, description, imageUrl } = post;

  return (
    <Link href={`/posts/${slug}`} className="block group">
      <article className="flex gap-4 sm:gap-6 items-start border-b border-gray-700/50 pb-6 sm:pb-8">
        <div className="flex-1 min-w-0">
          <PostInfo {...post} className="mb-1 sm:mb-2" />
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
  );
}
