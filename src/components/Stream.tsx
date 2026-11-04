"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StreamEntries } from "@/components/StreamEntry";
import { formatDate } from "@/lib/date";
import type { PostMeta } from "@/lib/posts";

type Mode = "latest" | "long";

const MODES: { id: Mode; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "long", label: "Long reads" },
];

type Props = {
  posts: PostMeta[];
  // Shuncha post ko'rsatiladi, qolgani "Show more posts" bilan ochiladi
  pageSize?: number;
  controls?: boolean;
  // Tugmalar va qidiruv ostiga qo'yiladigan blok (masalan, telefondagi mavzular qatori)
  children?: React.ReactNode;
};

function matches(post: PostMeta, query: string) {
  const text = [post.title, post.description, post.series?.name ?? "", ...post.tags.map((tag) => tag.name)].join(" ");
  return text.toLowerCase().includes(query);
}

// Ketma-ket kelgan bir kunlik postlar bitta guruh: postlar sana bo'yicha tartiblangan
function groupByDate(posts: PostMeta[]) {
  const groups: { date: string; posts: PostMeta[] }[] = [];
  for (const post of posts) {
    const last = groups.at(-1);
    if (last?.date === post.date) last.posts.push(post);
    else groups.push({ date: post.date, posts: [post] });
  }
  return groups;
}

// The Verge'dagi "Latest" lentasi: kunlar bo'yicha guruhlangan postlar, "Long reads" esa o'qish vaqti bo'yicha
export default function Stream({ posts, pageSize = 10, controls = true, children }: Props) {
  const [mode, setMode] = useState<Mode>("latest");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(pageSize);

  const query = search.trim().toLowerCase();
  const list = useMemo(() => {
    const found = query ? posts.filter((post) => matches(post, query)) : posts;
    return mode === "long" ? [...found].sort((a, b) => b.readingTime - a.readingTime) : found;
  }, [posts, query, mode]);
  // Qidiruvda hamma topilganlar birdaniga ko'rsatiladi
  const shown = query ? list : list.slice(0, visible);

  return (
    <div>
      {controls && (
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Sort posts" className="flex rounded-full bg-surface p-1 font-mono text-xs font-bold uppercase tracking-[0.08em]">
            {MODES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
                className={`h-10 rounded-full px-4 transition sm:px-5 ${mode === id ? "bg-violet-deep text-white" : "text-muted hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="relative min-w-0 flex-1 sm:ml-auto sm:max-w-64">
            <span className="sr-only">Search posts</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts"
              className="h-11 w-full rounded-full border border-line bg-transparent pl-10 pr-4 text-[15px] text-white outline-none placeholder:text-faint focus:border-muted [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
        </div>
      )}

      {children}

      {shown.length === 0 ? (
        <p className="py-12 text-center text-muted">No posts found</p>
      ) : mode === "latest" && !query ? (
        groupByDate(shown).map((group) => (
          <section key={group.date}>
            <h2 className="mt-7 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-faint">
              <time dateTime={group.date}>{formatDate(group.date)}</time>
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </h2>
            <StreamEntries posts={group.posts} />
          </section>
        ))
      ) : (
        <section className="mt-3">
          <h2 className="sr-only">{query ? "Search results" : "Long reads"}</h2>
          <StreamEntries posts={shown} />
        </section>
      )}

      {!query && visible < list.length && (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => setVisible((count) => count + pageSize)}
            className="h-12 rounded-full border border-line-strong px-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-violet transition hover:border-violet"
          >
            Show more posts
          </button>
        </div>
      )}
    </div>
  );
}
