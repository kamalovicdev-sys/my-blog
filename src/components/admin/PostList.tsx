"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleAlert, ExternalLink, FileText, Inbox, Plus, Search, X } from "lucide-react";
import type { AdminPostRow } from "@/lib/admin/posts";
import { formatDate } from "@/lib/date";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "scheduled", label: "Scheduled" },
  { id: "drafts", label: "Drafts" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];
type Status = "draft" | "scheduled" | "published";

const STATUS_STYLES: Record<Status, { label: string; className: string; dot: string }> = {
  draft: { label: "Draft", className: "bg-amber-400/10 text-amber-300", dot: "bg-amber-300" },
  scheduled: { label: "Scheduled", className: "bg-accent/10 text-accent", dot: "bg-accent" },
  published: { label: "Published", className: "bg-green-500/10 text-green-400", dot: "bg-green-400" },
};

function statusOf(row: AdminPostRow): Status {
  // Frontmatter'i buzuq fayllar qoralama hisoblanadi: ular saytga chiqmaydi
  if (!row.ok || row.draft) return "draft";
  return row.scheduled ? "scheduled" : "published";
}

function matchesFilter(row: AdminPostRow, filter: Filter) {
  if (filter === "all") return true;
  return statusOf(row) === (filter === "drafts" ? "draft" : filter);
}

function matchesQuery(row: AdminPostRow, query: string) {
  if (!query) return true;
  const text = row.ok ? [row.title, row.description, row.slug, row.fileName, ...row.tags].join(" ") : row.fileName;
  return text.toLowerCase().includes(query);
}

function StatusBadge({ status }: { status: Status }) {
  const { label, className, dot } = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function PostRow({ row }: { row: AdminPostRow }) {
  const editHref = `/admin/edit/${encodeURIComponent(row.fileName)}`;
  const status = statusOf(row);

  return (
    // Butun kartochka bosiladi (sarlavha havolasining ::after qatlami), "View" tugmasi uning ustida turadi
    <li className="group relative flex items-center gap-4 rounded-xl border border-transparent p-3 hover:border-gray-700/70 hover:bg-surface/60 transition sm:gap-5 sm:p-4">
      <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface sm:h-20 sm:w-32">
        {row.ok && row.imageUrl ? (
          <Image src={row.imageUrl} alt="" fill sizes="128px" unoptimized className="object-cover" />
        ) : row.ok ? (
          <FileText className="size-6 text-gray-600" />
        ) : (
          <CircleAlert className="size-6 text-red-400/70" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link href={editHref} className="block truncate font-semibold text-white after:absolute after:inset-0 after:rounded-xl group-hover:text-accent transition sm:text-lg">
          {row.ok ? row.title : row.fileName}
        </Link>
        {row.ok ? (
          <>
            <p className="mt-0.5 hidden truncate text-sm text-gray-400 sm:block">{row.description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <StatusBadge status={status} />
              <span>{status === "scheduled" ? `Goes live ${formatDate(row.date)}` : formatDate(row.date)}</span>
              <span className="hidden sm:inline">{row.readingTime} min read</span>
              {row.tags.slice(0, 3).map((tag) => <span key={tag} className="hidden text-gray-400 md:inline">#{tag}</span>)}
            </div>
          </>
        ) : (
          <p className="mt-1 line-clamp-2 text-xs text-red-400">{row.error}</p>
        )}
      </div>

      {row.ok && status === "published" && (
        <a
          href={`/posts/${row.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="View on site"
          aria-label={`View "${row.title}" on site`}
          className="relative z-10 hidden size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition sm:flex"
        >
          <ExternalLink className="size-4" />
        </a>
      )}
    </li>
  );
}

export default function PostList({ posts }: { posts: AdminPostRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const visible = posts.filter((row) => matchesFilter(row, filter) && matchesQuery(row, query));
  const counts = Object.fromEntries(FILTERS.map(({ id }) => [id, posts.filter((row) => matchesFilter(row, id)).length]));

  return (
    <section>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Posts</h1>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-surface p-1 text-sm [scrollbar-width:none]">
          {/* Rejalashtirilgan post bo'lmasa, bu tab ko'rinmaydi */}
          {FILTERS.filter(({ id }) => id !== "scheduled" || counts.scheduled > 0 || filter === "scheduled").map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition sm:flex-none ${filter === id ? "bg-background text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              {label}
              <span className={`text-xs tabular-nums ${filter === id ? "text-gray-400" : "text-gray-500"}`}>{counts[id]}</span>
            </button>
          ))}
        </div>

        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search posts…"
            aria-label="Search posts"
            className="w-full rounded-xl border border-gray-700 bg-surface py-2 pl-9 pr-9 text-sm outline-none placeholder:text-gray-500 focus:border-gray-400 transition [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-white">
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      {visible.length > 0 ? (
        <ul className="-mx-3 mt-6 space-y-1 sm:-mx-4">
          {visible.map((row) => <PostRow key={row.fileName} row={row} />)}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-gray-700 px-6 py-16 text-center">
          <Inbox className="size-10 text-gray-600" strokeWidth={1.5} />
          <p className="mt-4 font-semibold">
            {query ? "No posts match your search" : filter === "drafts" ? "No drafts" : filter === "scheduled" ? "No scheduled posts" : "No posts yet"}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {query
              ? "Try another word or clear the search."
              : filter === "scheduled"
                ? "Pick a future publish date in post settings, then schedule the post."
                : "Start writing and save it as a draft or publish it."}
          </p>
          {!query && (
            <Link href="/admin/new" className="mt-6 flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-background hover:bg-gray-200 transition">
              <Plus className="size-4" strokeWidth={2.5} />
              New post
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
