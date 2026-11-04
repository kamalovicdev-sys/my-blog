"use client";
import { useRef } from "react";
import Image from "next/image";
import { EyeOff, ExternalLink, ImagePlus, Trash2, Upload, X } from "lucide-react";
import DatePicker from "@/components/admin/DatePicker";
import TagInput from "@/components/admin/TagInput";
import type { PostForm } from "@/lib/admin/post-file";
import { formatDate, formatWeekdayDate, today } from "@/lib/date";
import { SITE_URL } from "@/lib/site";

type Props = {
  open: boolean;
  form: PostForm;
  slug: string;
  isNew: boolean;
  isPublished: boolean;
  isScheduled: boolean;
  savedDate: string;
  busy: boolean;
  tagSuggestions: string[];
  seriesSuggestions: string[];
  cover: { url: string; source: "custom" | "auto" } | null;
  onChange: <K extends keyof PostForm>(key: K, value: PostForm[K]) => void;
  onSlugChange: (slug: string) => void;
  onUploadCover: (file: File) => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onClose: () => void;
};

const INPUT_CLASS = "w-full rounded-lg border border-gray-700 bg-background px-3 py-2 text-sm outline-none focus:border-gray-400 transition";
const SMALL_BUTTON = "flex items-center gap-1.5 rounded-lg border border-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition";

function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{hint}</p>}
    </div>
  );
}

// Sana ostidagi izoh: kelajak sana tanlansa post o'sha kuni o'zi saytga chiqadi
function publishDateHint(date: string, now: string, { isPublished, isScheduled, savedDate }: Pick<Props, "isPublished" | "isScheduled" | "savedDate">) {
  const future = date > now;
  const day = formatWeekdayDate(date, "long");
  if (isScheduled) {
    if (!future) return "Updating with this date publishes the post right away.";
    if (date !== savedDate) return `Click Update to reschedule it for ${day}.`;
    return `Goes live automatically on ${day}, shortly after midnight (Tashkent time).`;
  }
  if (isPublished) {
    return future ? <span className="text-amber-300">This post is live. Updating it with a future date hides it from the site until {formatDate(date)}.</span> : null;
  }
  return future ? `Publishing will schedule it: the post goes live automatically on ${day}.` : "Pick a future date to schedule the post.";
}

// URL, sana, teglar, cover va xavfli amallar: yozish maydonini band qilmasligi uchun o'ng panelda
export default function SettingsPanel(props: Props) {
  const { open, form, slug, isNew, isPublished, isScheduled, savedDate, busy, cover, onChange } = props;
  const now = today();
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside
      aria-label="Post settings"
      className={`fixed bottom-0 right-0 top-14 z-40 flex w-full flex-col border-l border-gray-700/70 bg-surface shadow-2xl shadow-black/40 transition-[translate,visibility] duration-200 sm:w-96 ${open ? "translate-x-0" : "invisible translate-x-full"}`}
    >
      <div className="flex items-center justify-between border-b border-gray-700/70 px-5 py-3">
        <h2 className="font-bold">Post settings</h2>
        <button onClick={props.onClose} aria-label="Close settings" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
        <Field
          label="Post URL"
          hint={
            isNew ? (
              "Generated from the title. You can change it before the first save."
            ) : isScheduled ? (
              `${SITE_URL.replace(/^https?:\/\//, "")}/posts/${slug} · live from ${formatDate(savedDate)}`
            ) : isPublished ? (
              <a href={`/posts/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 hover:text-white">
                {SITE_URL.replace(/^https?:\/\//, "")}/posts/{slug}
                <ExternalLink className="size-3" />
              </a>
            ) : (
              "The URL cannot be changed after the first save."
            )
          }
        >
          <div className="flex items-center rounded-lg border border-gray-700 bg-background text-sm focus-within:border-gray-400 transition">
            <span className="pl-3 text-gray-500">/posts/</span>
            <input
              value={slug}
              readOnly={!isNew}
              onChange={(event) => props.onSlugChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 pr-3 outline-none read-only:text-gray-400"
            />
          </div>
        </Field>

        <Field label="Publish date" hint={publishDateHint(form.date, now, props)}>
          <DatePicker value={form.date} today={now} onChange={(value) => onChange("date", value)} />
        </Field>

        <Field label="Tags" hint="Press Enter or comma to add a tag.">
          <TagInput value={form.tags} onChange={(value) => onChange("tags", value)} suggestions={props.tagSuggestions} />
        </Field>

        <Field label="Series" hint="Posts with the same series name are linked together and shown in part order.">
          <div className="flex gap-2">
            <input
              value={form.series}
              onChange={(event) => onChange("series", event.target.value)}
              list="series-suggestions"
              placeholder="Not part of a series"
              aria-label="Series name"
              className={`${INPUT_CLASS} min-w-0 flex-1`}
            />
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={form.part}
              onChange={(event) => onChange("part", event.target.value)}
              disabled={!form.series.trim()}
              placeholder="Part"
              aria-label="Part number"
              className="w-20 shrink-0 rounded-lg border border-gray-700 bg-background px-3 py-2 text-sm outline-none transition focus:border-gray-400 disabled:opacity-40"
            />
          </div>
          <datalist id="series-suggestions">
            {props.seriesSuggestions.map((name) => <option key={name} value={name} />)}
          </datalist>
        </Field>

        <Field
          label="Cover image"
          hint={cover?.source === "auto" ? "Using the first image in the post. Upload a cover to use a different one." : "Shown on the home page and in link previews."}
        >
          <div className="relative aspect-[1.91/1] overflow-hidden rounded-lg border border-gray-700 bg-background">
            {cover ? (
              <>
                <Image src={cover.url} alt="" fill sizes="384px" unoptimized className="object-cover" />
                {cover.source === "auto" && (
                  <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-gray-300 backdrop-blur">From post text</span>
                )}
              </>
            ) : (
              <button onClick={() => coverInputRef.current?.click()} className="flex size-full flex-col items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition">
                <ImagePlus className="size-7" strokeWidth={1.5} />
                Upload cover
              </button>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => coverInputRef.current?.click()} className={SMALL_BUTTON}>
              <Upload className="size-3.5" />
              {form.cover ? "Replace" : "Upload"}
            </button>
            {form.cover && (
              <button onClick={() => onChange("cover", "")} className={SMALL_BUTTON}>
                <X className="size-3.5" />
                Remove
              </button>
            )}
          </div>
          <input
            value={form.cover}
            onChange={(event) => onChange("cover", event.target.value)}
            placeholder="../images/cover.webp"
            aria-label="Cover image path"
            className={`${INPUT_CLASS} mt-2 font-mono text-xs`}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) props.onUploadCover(file);
              event.target.value = "";
            }}
          />
        </Field>

        {!isNew && (
          <div className="space-y-2 border-t border-gray-700/70 pt-6">
            {isPublished && (
              <button
                onClick={props.onUnpublish}
                disabled={busy}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-50 transition"
              >
                <EyeOff className="size-4 shrink-0" />
                <span>
                  <span className="block font-semibold">{isScheduled ? "Unschedule" : "Unpublish"}</span>
                  <span className="block text-xs text-gray-500">{isScheduled ? "Cancel the schedule and keep it as a draft" : "Remove from the site and keep it as a draft"}</span>
                </span>
              </button>
            )}
            <button
              onClick={props.onDelete}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition"
            >
              <Trash2 className="size-4 shrink-0" />
              <span>
                <span className="block font-semibold">Delete post</span>
                <span className="block text-xs text-red-400/60">The file is removed from GitHub</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
