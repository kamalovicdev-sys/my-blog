import Image from "next/image";
import Link from "next/link";
import type { PostMeta, Tag } from "@/lib/posts";
import { seriesLabel } from "@/lib/series";
import { AUTHOR_NAME } from "@/lib/site";

// Tashqi saytlardagi rasmlar next.config'da ruxsat etilmagan, ular o'zgarishsiz ko'rsatiladi
function isLocalImage(url: string) {
  return url.startsWith("/");
}

// Qisqa postda sarlavha gapning boshi bo'lib turadi: "Sarlavha. Tavsif..."
function asLeadIn(title: string) {
  return /[.!?…:]$/.test(title) ? title : `${title}.`;
}

export function Byline({ post }: { post: PostMeta }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.1em]">
      {post.series && <span className="bg-alert px-1.5 py-0.5 font-bold text-white">{seriesLabel(post.series)}</span>}
      <span className="text-violet">{AUTHOR_NAME}</span>
      <span className="font-mono text-faint">{post.readingTime} min read</span>
      {post.draft && <span className="font-mono text-amber-400">Draft</span>}
      {post.scheduled && <span className="font-mono text-accent">Scheduled</span>}
    </p>
  );
}

export function TagList({ tags }: { tags: Tag[] }) {
  return (
    <p className="flex flex-wrap gap-x-3.5 gap-y-1.5 font-mono text-xs">
      {tags.map((tag) => (
        <Link key={tag.slug} href={`/tags/${tag.slug}`} className="text-muted hover:text-white">
          [{tag.name}]
        </Link>
      ))}
    </p>
  );
}

// Katta kartochka: rasm, sarlavha, tavsif va teglar
export function FeatureEntry({ post }: { post: PostMeta }) {
  return (
    <article className="flex flex-col gap-3.5 border-b border-line py-6">
      <Byline post={post} />
      <Link href={`/posts/${post.slug}`} className="group flex flex-col gap-3.5">
        {post.imageUrl && (
          <div className="relative aspect-video overflow-hidden bg-surface">
            <Image
              src={post.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              unoptimized={!isLocalImage(post.imageUrl)}
              className="object-cover transition-opacity group-hover:opacity-90"
            />
          </div>
        )}
        <h3 className="font-headline text-[26px] font-extrabold leading-[1.1] text-white decoration-2 underline-offset-[5px] group-hover:underline sm:text-[31px]">
          {post.title}
        </h3>
      </Link>
      <p className="line-clamp-4 font-serif text-[17px] leading-[1.55] text-prose sm:text-lg">{post.description}</p>
      {post.tags.length > 0 && <TagList tags={post.tags} />}
    </article>
  );
}

// Sarlavha va tavsif chapda, kichik rasm o'ngda. Telefonda tavsif yashiriladi
export function CompactEntry({ post }: { post: PostMeta }) {
  return (
    <article className="flex gap-4 border-b border-line py-6 sm:gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Byline post={post} />
        <h3 className="font-headline text-xl font-extrabold leading-[1.15] sm:text-[23px]">
          <Link href={`/posts/${post.slug}`} className="decoration-2 underline-offset-4 hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 font-serif text-[17px] leading-normal text-prose max-sm:hidden">{post.description}</p>
      </div>
      {post.imageUrl && (
        <Link href={`/posts/${post.slug}`} tabIndex={-1} aria-hidden="true" className="relative size-[88px] shrink-0 overflow-hidden bg-surface sm:size-[120px]">
          <Image src={post.imageUrl} alt="" fill sizes="120px" unoptimized={!isLocalImage(post.imageUrl)} className="object-cover" />
        </Link>
      )}
    </article>
  );
}

// Rasmsiz qisqa post: qalin sarlavha va davomida tavsif
export function QuickEntry({ post }: { post: PostMeta }) {
  return (
    <article className="flex flex-col gap-3 border-b border-line py-6">
      <Byline post={post} />
      <p className="line-clamp-5 font-serif text-[17px] leading-[1.55] text-prose sm:text-lg">
        <Link href={`/posts/${post.slug}`} className="font-headline font-extrabold text-white decoration-2 underline-offset-4 hover:underline">
          {asLeadIn(post.title)}
        </Link>{" "}
        {post.description}
      </p>
    </article>
  );
}

// Rasmli birinchi post katta kartochka, qolgan rasmlilar kichik rasm bilan, rasmsizlar faqat matn bilan
export function StreamEntries({ posts }: { posts: PostMeta[] }) {
  const featureIndex = posts.findIndex((post) => post.imageUrl);
  return posts.map((post, index) => {
    if (index === featureIndex) return <FeatureEntry key={post.slug} post={post} />;
    if (post.imageUrl) return <CompactEntry key={post.slug} post={post} />;
    return <QuickEntry key={post.slug} post={post} />;
  });
}
