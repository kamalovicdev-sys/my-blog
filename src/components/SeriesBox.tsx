import Link from "next/link";
import type { PostMeta, SeriesInfo } from "@/lib/posts";

// Post sahifasida: seriyaning barcha qismlari tartib bilan, joriy qism belgilangan
export default function SeriesBox({ series, posts, currentSlug }: { series: SeriesInfo; posts: PostMeta[]; currentSlug: string }) {
  return (
    <nav aria-label={`Series: ${series.name}`} className="mb-8 border-t-4 border-violet bg-surface/60 px-3 py-4 sm:px-4">
      <p className="px-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-faint">
        Series · <span className="font-headline text-sm normal-case tracking-normal text-white">{series.name}</span>
      </p>
      <ol className="mt-2 space-y-1">
        {posts.map((post, index) => {
          const current = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                aria-current={current ? "page" : undefined}
                className={`flex items-baseline gap-3 rounded px-2 py-1.5 transition ${current ? "bg-white/5 text-white" : "text-muted hover:text-white"}`}
              >
                <span aria-hidden="true" className="w-5 shrink-0 font-display text-xl text-violet">{post.series?.part ?? index + 1}</span>
                <span className="flex-1 font-headline font-semibold leading-snug">{post.title}</span>
                <span className="shrink-0 font-mono text-[11px] uppercase text-faint">{post.readingTime} min</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
