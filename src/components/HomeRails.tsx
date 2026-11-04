import Link from "next/link";
import type { PostMeta, Tag } from "@/lib/posts";
import { SOCIAL } from "@/lib/site";

type TopicCount = { slug: string; name: string; count: number };
type SeriesGroup = { name: string; slug: string; posts: PostMeta[] };

function RailHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-faint">
      {children}
    </h2>
  );
}

function RailLink({ href, name, count }: { href: string; name: string; count: number }) {
  return (
    <Link href={href} className="group flex gap-2 text-[17px] leading-snug">
      <span aria-hidden="true" className="text-violet">/</span>
      <span className="flex-1 underline-offset-4 group-hover:underline">{name}</span>
      <span className="text-faint">{count}</span>
    </Link>
  );
}

// Keng ekranda chap ustun: mavzular va seriyalar
export function TopicNav({ topics, series }: { topics: TopicCount[]; series: SeriesGroup[] }) {
  return (
    <nav aria-label="Topics and series" className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <RailHeading>Topics</RailHeading>
        {topics.map((topic) => <RailLink key={topic.slug} href={`/topics/${topic.slug}`} name={topic.name} count={topic.count} />)}
      </div>
      {series.length > 0 && (
        <div className="flex flex-col gap-3">
          <RailHeading>Series</RailHeading>
          {/* Seriya birinchi qismidan boshlab o'qiladi */}
          {series.map((entry) => <RailLink key={entry.slug} href={`/posts/${entry.posts[0].slug}`} name={entry.name} count={entry.posts.length} />)}
        </div>
      )}
    </nav>
  );
}

// Tor ekranda mavzular lentaning tepasida, yonga suriladigan qator bo'lib turadi.
// Menyudagi "Topics" shu yerga olib keladi; keng ekranda mavzular chap ustunda, sahifa tepasida ko'rinib turadi
export function TopicChips({ topics }: { topics: TopicCount[] }) {
  return (
    <nav id="topics" aria-label="Topics" className="-mx-4 mt-4 flex scroll-mt-6 gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 xl:hidden">
      {topics.map((topic) => (
        <Link
          key={topic.slug}
          href={`/topics/${topic.slug}`}
          className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3.5 text-[15px] transition hover:border-line-strong"
        >
          <span aria-hidden="true" className="text-violet">/</span>
          {topic.name}
          <span className="text-faint">{topic.count}</span>
        </Link>
      ))}
    </nav>
  );
}

// O'qish vaqti eng uzun postlar. Telefonda faqat birinchi uchtasi
export function LongReads({ posts }: { posts: PostMeta[] }) {
  return (
    <section aria-labelledby="long-reads-title" className="border-t-4 border-violet pt-3">
      <h2 id="long-reads-title" className="font-headline text-[22px] font-extrabold">Long reads</h2>
      <ol>
        {posts.map((post, index) => (
          <li key={post.slug} className={`border-b border-line last:border-0 ${index >= 3 ? "max-lg:hidden" : ""}`}>
            <Link href={`/posts/${post.slug}`} className="group flex gap-4 py-4">
              <span aria-hidden="true" className="w-[30px] shrink-0 font-display text-[44px] leading-[0.9] text-violet">{index + 1}</span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="font-headline text-[17px] font-bold leading-tight underline-offset-4 group-hover:underline">{post.title}</span>
                <span className="font-mono text-[11px] uppercase text-faint">{post.readingTime} min</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TelegramCard() {
  const handle = SOCIAL.telegramChannel.replace(/^https?:\/\/t\.me\//, "");
  return (
    <section aria-labelledby="telegram-title" className="flex flex-col gap-3 bg-violet-deep p-6 max-lg:-mx-4 max-lg:px-4 sm:max-lg:-mx-6 sm:max-lg:px-6">
      <h2 id="telegram-title" className="font-display text-[34px] font-normal leading-none text-white">Get every new post in Telegram</h2>
      <p className="font-serif text-base leading-normal text-[#e6dfff]">Get new posts in the Telegram channel.</p>
      <a
        href={SOCIAL.telegramChannel}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 items-center justify-center self-start bg-white px-4 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#2a0a8f] transition hover:bg-[#ece8ff] max-lg:self-stretch"
      >
        Join @{handle}
      </a>
    </section>
  );
}

export function TagCloud({ tags }: { tags: Tag[] }) {
  return (
    <section aria-labelledby="tags-title" className="flex flex-col gap-3 max-lg:hidden">
      <RailHeading id="tags-title">Tags</RailHeading>
      <p className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs">
        {tags.map((tag) => (
          <Link key={tag.slug} href={`/tags/${tag.slug}`} className="text-muted hover:text-white">
            [{tag.name}]
          </Link>
        ))}
      </p>
    </section>
  );
}
