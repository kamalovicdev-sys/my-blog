"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CodeCopyButtons from "@/components/CodeCopyButtons";
import PostBody from "@/components/PostBody";
import type { PostForm } from "@/lib/admin/post-file";
import { slugify } from "@/lib/slug";

type Props = { fileName?: string; sha?: string; slug?: string; initial: PostForm };
type Status = { kind: "info" | "success" | "error"; text: string; link?: { href: string; label: string } };

const PREVIEW_DELAY = 400;
const MAX_IMAGE_WIDTH = 1600;
const CONVERTIBLE_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const JSON_HEADERS = { "Content-Type": "application/json" };

const INPUT_CLASS = "w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 outline-none focus:border-white transition";
const STATUS_COLORS = { info: "text-gray-300", success: "text-green-400", error: "text-red-400" };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Katta rasmlar brauzerning o'zida 1600px'gacha kichraytirilib webp'ga o'giriladi. GIF va SVG o'zgarishsiz yuklanadi
async function prepareImage(file: File, fallbackName: string) {
  // Clipboard'dan qo'yilgan skrinshot odatda "image.png" deb nomlanadi
  const baseName = file.name && file.name !== "image.png" ? file.name.replace(/\.[^.]+$/, "") : fallbackName;
  const original = async () => ({ name: file.name || `${baseName}.png`, baseName, data: await blobToBase64(file) });
  if (!CONVERTIBLE_IMAGE_TYPES.includes(file.type)) return original();

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));

  // Brauzer webp yarata olmasa (eski Safari), asl fayl yuklanadi
  if (!webp || webp.type !== "image/webp") return original();
  return { name: `${baseName}.webp`, baseName, data: await blobToBase64(webp) };
}

function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export default function PostEditor({ fileName, sha, slug: initialSlug, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  // GitHub'dagi oxirgi saqlangan holat: keyingi saqlashda sha konfliktni aniqlash uchun kerak
  const [saved, setSaved] = useState({ fileName, sha, slug: initialSlug, draft: initial.draft });
  // Yangi postda URL sarlavhadan yasaladi, qo'lda o'zgartirilsa shu qiymat ishlatiladi
  const [customSlug, setCustomSlug] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNew = !saved.fileName;
  const isPublished = !isNew && !saved.draft;
  const slug = isNew ? (customSlug ?? slugify(form.title)) : (saved.slug ?? "");

  const update = <K extends keyof PostForm>(key: K, value: PostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  // Jonli ko'rinish server'da sayt bilan bir xil markdown pipeline orqali yasaladi
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ markdown: form.body }),
          signal: controller.signal,
        });
        if (response.ok) setPreviewHtml((await response.json()).html);
      } catch {
        // Yangi matn kiritilganda eski so'rov bekor qilinadi
      }
    }, PREVIEW_DELAY);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.body]);

  // Saqlanmagan o'zgarishlar bilan sahifani yopishda brauzer ogohlantiradi
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Belgilangan matnni almashtiradi. execCommand Ctrl+Z tarixini saqlaydi, ishlamasa qiymat to'g'ridan-to'g'ri o'zgartiriladi
  const replaceSelection = (text: string, selectFrom = text.length, selectTo = selectFrom) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    const start = textarea.selectionStart;
    if (!document.execCommand("insertText", false, text)) {
      textarea.setRangeText(text, start, textarea.selectionEnd, "end");
      update("body", textarea.value);
    }
    textarea.setSelectionRange(start + selectFrom, start + selectTo);
  };

  const wrap = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || placeholder;
    replaceSelection(before + selected + after, before.length, before.length + selected.length);
  };

  // Joriy qator boshiga belgi qo'yadi: sarlavha, ro'yxat, iqtibos
  const prefixLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const lineStart = textarea.value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart);
    replaceSelection(prefix);
  };

  const tools = [
    { label: "B", title: "Bold (Ctrl+B)", className: "font-bold", run: () => wrap("**", "**", "bold text") },
    { label: "I", title: "Italic (Ctrl+I)", className: "italic", run: () => wrap("*", "*", "italic text") },
    { label: "H", title: "Heading", className: "font-bold", run: () => prefixLine("## ") },
    { label: "Link", title: "Link", run: () => wrap("[", "](https://)", "link text") },
    { label: "`code`", title: "Inline code", className: "font-mono", run: () => wrap("`", "`", "code") },
    { label: "Code block", title: "Code block", run: () => wrap("\n```python\n", "\n```\n", "print('hello')") },
    { label: "$x$", title: "Inline formula", run: () => wrap("$", "$", "x^2") },
    { label: "∑ Formula", title: "Formula block", run: () => wrap("\n$$\n", "\n$$\n", "E = mc^2") },
    { label: "• List", title: "List", run: () => prefixLine("- ") },
    { label: "❝ Quote", title: "Quote", run: () => prefixLine("> ") },
    { label: "Image", title: "Upload image (you can also paste or drop it into the text)", run: () => fileInputRef.current?.click() },
  ];

  const uploadImages = async (files: File[]) => {
    for (const file of files.filter((item) => item.type.startsWith("image/"))) {
      setStatus({ kind: "info", text: `Uploading ${file.name || "image"}…` });
      try {
        const image = await prepareImage(file, slug || "image");
        const response = await fetch("/api/admin/images", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ name: image.name, data: image.data }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        replaceSelection(`![${image.baseName}](${result.markdownPath})\n`);
        setStatus({ kind: "success", text: "Image uploaded" });
      } catch (error) {
        setStatus({ kind: "error", text: `Image upload failed: ${errorMessage(error)}` });
      }
    }
  };

  const save = async (draft: boolean) => {
    if (busy) return;
    if (!form.title.trim()) {
      setStatus({ kind: "error", text: "Title is required" });
      return;
    }

    setBusy(true);
    setStatus({ kind: "info", text: draft ? "Saving…" : "Publishing…" });
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ fileName: saved.fileName, sha: saved.sha, wasDraft: saved.draft, slug, form: { ...form, draft } }),
      });
      const result = await response.json();
      if (response.status === 401) {
        setStatus({ kind: "error", text: result.error, link: { href: "/admin/login", label: "Sign in (new tab)" } });
        return;
      }
      if (!response.ok) throw new Error(result.error);

      setForm((current) => ({ ...current, draft }));
      setSaved({ fileName: result.fileName, sha: result.sha, slug: result.slug, draft });
      setDirty(false);
      // Sahifani qayta yuklamasdan manzilni tahrirlash sahifasiga almashtiramiz
      if (isNew) window.history.replaceState(null, "", `/admin/edit/${encodeURIComponent(result.fileName)}`);

      if (!draft) {
        setStatus({ kind: "success", text: "Published. The site will update in about a minute.", link: { href: `/posts/${result.slug}`, label: "View post ↗" } });
      } else if (isPublished) {
        setStatus({ kind: "success", text: "Unpublished. The post will disappear from the site in about a minute." });
      } else {
        setStatus({ kind: "success", text: "Draft saved. It is not visible on the site." });
      }
    } catch (error) {
      setStatus({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!saved.fileName || !saved.sha || busy) return;
    if (!window.confirm(`Delete "${form.title || saved.fileName}"? This cannot be undone here.`)) return;

    setBusy(true);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ fileName: saved.fileName, sha: saved.sha, title: form.title, wasDraft: saved.draft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDirty(false);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setStatus({ kind: "error", text: errorMessage(error) });
      setBusy(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      save(form.draft);
    } else if (event.target === textareaRef.current && (key === "b" || key === "i")) {
      event.preventDefault();
      if (key === "b") wrap("**", "**", "bold text");
      else wrap("*", "*", "italic text");
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="space-y-6 pb-28">
      <CodeCopyButtons />

      <div className="flex items-center justify-between gap-4">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition">← All posts</Link>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isPublished ? "bg-green-500/10 text-green-400" : "bg-amber-400/10 text-amber-300"}`}>
          {isNew ? "New post" : isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2">
          <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Post title" className={`${INPUT_CLASS} text-lg font-bold`} />
        </Field>
        <Field label="URL" hint={isNew ? "Generated from the title. You can change it before the first save." : "The URL cannot be changed after the first save."}>
          <div className="flex items-center rounded-lg border border-gray-700 bg-surface focus-within:border-white transition">
            <span className="pl-3 text-sm text-gray-500">/posts/</span>
            <input
              value={slug}
              readOnly={!isNew}
              onChange={(event) => {
                setCustomSlug(event.target.value);
                setDirty(true);
              }}
              className="min-w-0 flex-1 bg-transparent py-2 pr-3 outline-none read-only:text-gray-400"
            />
          </div>
        </Field>
        <Field label="Date">
          <input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Tags" hint="Comma separated, for example: linux, python">
          <input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="linux, python" className={INPUT_CLASS} />
        </Field>
        <Field label="Cover image" hint="Optional. By default the first image in the post is used.">
          <input value={form.cover} onChange={(event) => update("cover", event.target.value)} placeholder="../images/cover.webp" className={INPUT_CLASS} />
        </Field>
        <Field label="Description" hint="Optional. Shown on the home page and in link previews. By default the first paragraphs are used." className="sm:col-span-2">
          <textarea rows={2} value={form.description} onChange={(event) => update("description", event.target.value)} className={`${INPUT_CLASS} resize-y`} />
        </Field>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-700">
        <div className="flex items-center gap-2 border-b border-gray-700 bg-surface px-2 py-1.5">
          <div className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {tools.map((tool) => (
              <button
                key={tool.title}
                type="button"
                title={tool.title}
                onClick={tool.run}
                className={`shrink-0 rounded-md px-2.5 py-1 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition ${tool.className ?? ""}`}
              >
                {tool.label}
              </button>
            ))}
          </div>
          {/* Telefonda yozish va ko'rish navbat bilan, kompyuterda yonma-yon */}
          <div className="flex shrink-0 rounded-lg bg-background p-0.5 text-sm lg:hidden">
            {(["write", "preview"] as const).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`rounded-md px-3 py-1 capitalize transition ${tab === name ? "bg-surface text-white" : "text-gray-400"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-2">
          <textarea
            ref={textareaRef}
            value={form.body}
            onChange={(event) => update("body", event.target.value)}
            onPaste={(event) => {
              const files = Array.from(event.clipboardData.files);
              if (files.some((file) => file.type.startsWith("image/"))) {
                event.preventDefault();
                uploadImages(files);
              }
            }}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes("Files")) event.preventDefault();
            }}
            onDrop={(event) => {
              const files = Array.from(event.dataTransfer.files);
              if (files.length > 0) {
                event.preventDefault();
                uploadImages(files);
              }
            }}
            placeholder="Write your post in Markdown. Paste or drop images right here."
            spellCheck={false}
            className={`${tab === "preview" ? "hidden lg:block" : "block"} h-[65vh] w-full resize-none bg-background p-4 font-mono text-sm leading-relaxed text-gray-200 outline-none`}
          />
          <div className={`${tab === "write" ? "hidden lg:block" : "block"} h-[65vh] overflow-y-auto border-gray-700 bg-background p-4 sm:p-6 lg:border-l`}>
            {form.body.trim() ? <PostBody html={previewHtml} /> : <p className="text-sm text-gray-500">The preview appears here as you type.</p>}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          uploadImages(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {/* Saqlash tugmalari sahifa pastida doim ko'rinib turadi */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-700/50 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className={`min-w-0 flex-1 text-sm ${status ? STATUS_COLORS[status.kind] : "text-gray-500"}`}>
            {status?.text ?? (dirty ? "Unsaved changes" : "")}
            {status?.link && (
              <a href={status.link.href} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
                {status.link.label}
              </a>
            )}
          </p>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button type="button" onClick={remove} disabled={busy} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition">
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => save(true)}
              disabled={busy}
              title={isPublished ? "Remove the post from the site and keep it as a draft" : "Save without publishing (Ctrl+S)"}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:border-white hover:text-white disabled:opacity-50 transition"
            >
              {isPublished ? "Unpublish" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => save(false)}
              disabled={busy}
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-background hover:bg-gray-200 disabled:opacity-50 transition"
            >
              {isPublished ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
