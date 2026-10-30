"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, CircleCheck, Copy, ExternalLink, Info, LoaderCircle, Send, TriangleAlert, X } from "lucide-react";
import PostCard from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  step: "confirm" | "done";
  busy: boolean;
  post: PostMeta;
  hasDescription: boolean;
  coverSource: "custom" | "auto" | "none";
  onConfirm: () => void;
  onClose: () => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">{children}</p>;
}

function CheckItem({ ok, warn, children }: { ok: boolean; warn?: boolean; children: React.ReactNode }) {
  const Icon = ok ? Check : warn ? TriangleAlert : Info;
  return (
    <li className="flex gap-2.5">
      <Icon className={`mt-0.5 size-4 shrink-0 ${ok ? "text-green-400" : warn ? "text-amber-400" : "text-gray-500"}`} />
      <span>{children}</span>
    </li>
  );
}

// Telegram'da havola tashlanganda chiqadigan ko'rinish (og:title, og:description, og:image)
function TelegramPreview({ url, post }: { url: string; post: PostMeta }) {
  return (
    <div className="max-w-md rounded-2xl rounded-bl-md bg-[#182533] p-2.5 text-[15px] leading-snug">
      <p className="break-all text-[#6ab2f2]">{url}</p>
      <div className="mt-1.5 rounded-md border-l-[3px] border-[#6ab2f2] bg-[#6ab2f2]/10 py-1.5 pl-2.5 pr-2 text-sm">
        <p className="font-semibold text-[#6ab2f2]">{SITE_NAME}</p>
        <p className="font-semibold text-white">{post.title}</p>
        <p className="line-clamp-3 text-gray-200">{post.description}</p>
        {post.imageUrl && (
          <div className="relative mt-2 aspect-[1.91/1] overflow-hidden rounded-md bg-background">
            <Image src={post.imageUrl} alt="" fill sizes="448px" unoptimized className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublishDialog({ step, busy, post, hasDescription, coverSource, onConfirm, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/posts/${post.slug}`;

  // Oyna ochiq paytida orqadagi sahifa scroll bo'lmaydi
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Brauzer ruxsat bermasa, havola baribir ekranda ko'rinib turadi
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => event.target === event.currentTarget && !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-gray-700 bg-surface shadow-2xl sm:rounded-3xl"
      >
        {step === "done" ? (
          <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
            <CircleCheck className="size-14 text-green-400" strokeWidth={1.5} />
            <h2 id="publish-title" className="mt-4 text-2xl font-bold">Published!</h2>
            <p className="mt-2 text-sm text-gray-400">The site is rebuilding. The post will be live in about a minute.</p>
            <div className="mt-6 flex w-full items-center gap-2 rounded-xl border border-gray-700 bg-background p-1.5 pl-3 text-left text-sm">
              <span className="min-w-0 flex-1 truncate text-gray-300">{url}</span>
              <button onClick={copyLink} className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-300 hover:bg-white/5 hover:text-white transition">
                {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-8 flex w-full gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl border border-gray-600 px-4 py-2.5 font-semibold text-gray-200 hover:border-white hover:text-white transition">
                Keep editing
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-bold text-background hover:bg-gray-200 transition">
                View post
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-gray-700/70 px-6 py-5">
              <div>
                <h2 id="publish-title" className="text-xl font-bold">Ready to publish?</h2>
                <p className="mt-1 text-sm text-gray-400">This is how the post will look on the home page and when shared.</p>
              </div>
              <button onClick={onClose} disabled={busy} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50 transition">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div>
                <SectionLabel>Home page</SectionLabel>
                {/* Saytdagi kartochkaning o'zi, faqat bosib bo'lmaydi */}
                <div inert className="rounded-xl bg-background p-4 [&_article]:border-0 [&_article]:pb-0">
                  <PostCard post={post} />
                </div>
              </div>

              <div>
                <SectionLabel>Link preview in Telegram</SectionLabel>
                <div className="rounded-xl bg-[#0e1621] p-4">
                  <TelegramPreview url={url} post={post} />
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-300">
                <CheckItem ok={hasDescription}>
                  {hasDescription ? "Custom description" : "No description: the first paragraph is used instead."}
                </CheckItem>
                <CheckItem ok={coverSource !== "none"} warn>
                  {coverSource === "custom" ? "Cover image is set" : coverSource === "auto" ? "The first image in the post is used as the cover." : "No image: the card and link preview show text only."}
                </CheckItem>
                <CheckItem ok={post.tags.length > 0}>
                  {post.tags.length > 0 ? `Tags: ${post.tags.map((tag) => `#${tag.name}`).join(" ")}` : "No tags"}
                </CheckItem>
              </ul>
            </div>

            <div className="flex gap-3 border-t border-gray-700/70 px-6 py-4">
              <button onClick={onClose} disabled={busy} className="flex-1 rounded-xl border border-gray-600 px-4 py-2.5 font-semibold text-gray-200 hover:border-white hover:text-white disabled:opacity-50 transition sm:flex-none">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 font-bold text-background hover:bg-gray-200 disabled:opacity-70 transition sm:ml-auto sm:flex-none"
              >
                {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                {busy ? "Publishing…" : "Publish now"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
