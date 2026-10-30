"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  Check,
  CircleAlert,
  CircleCheck,
  Code,
  Columns2,
  Eye,
  Heading2,
  History,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  LoaderCircle,
  PenLine,
  Pi,
  Quote,
  Settings2,
  Sigma,
  SquareCode,
  Table,
  X,
  type LucideIcon,
} from "lucide-react";
import CodeCopyButtons from "@/components/CodeCopyButtons";
import PostBody from "@/components/PostBody";
import { PostInfo } from "@/components/PostCard";
import TagLink from "@/components/TagLink";
import PublishDialog from "@/components/admin/PublishDialog";
import SettingsPanel from "@/components/admin/SettingsPanel";
import { splitTags } from "@/components/admin/TagInput";
import type { PostForm } from "@/lib/admin/post-file";
import { adminImageUrl, findFirstImage } from "@/lib/images";
import type { Tag } from "@/lib/posts";
import { slugify } from "@/lib/slug";

type Props = { fileName?: string; sha?: string; slug?: string; initial: PostForm; tagSuggestions: string[] };
type Notice = { kind: "info" | "success" | "error"; text: string; link?: { href: string; label: string } };
type View = "write" | "split" | "preview";
type Preview = { html: string; words: number; readingTime: number; excerpt: string };
// Brauzerda saqlangan, GitHub'ga hali yuborilmagan matn. sha: qaysi versiya ustida yozilgani
type LocalDraft = { form: PostForm; customSlug: string | null; sha?: string; savedAt: number };

const PREVIEW_DELAY = 400;
const AUTOSAVE_DELAY = 1000;
const NOTICE_DURATION = 6000;
const MAX_IMAGE_WIDTH = 1600;
const CONVERTIBLE_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const JSON_HEADERS = { "Content-Type": "application/json" };
const CONTENT_KEYS = ["title", "date", "description", "tags", "cover", "body"] as const;

const VIEWS: { id: View; label: string; icon: LucideIcon; className?: string }[] = [
  { id: "write", label: "Write", icon: PenLine },
  // Yonma-yon ko'rinish faqat keng ekranda
  { id: "split", label: "Side by side", icon: Columns2, className: "hidden lg:flex" },
  { id: "preview", label: "Preview", icon: Eye },
];

const NOTICE_STYLES = {
  info: { icon: LoaderCircle, className: "text-gray-400 animate-spin" },
  success: { icon: CircleCheck, className: "text-green-400" },
  error: { icon: CircleAlert, className: "text-red-400" },
};

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

// draft holati bundan mustasno: u faqat Save/Publish/Unpublish bilan o'zgaradi
function sameContent(a: PostForm, b: PostForm) {
  return CONTENT_KEYS.every((key) => a[key] === b[key]);
}

// Saqlanmagan matn brauzerda shu kalit bilan turadi. Bu GitHub'ga commit emas, tab yopilib qolsa yo'qolmasligi uchun
function localDraftKey(fileName?: string) {
  return `blog-admin:draft:${fileName ?? "new"}`;
}

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Maxfiy oynada yoki joy tugaganda brauzer saqlashga ruxsat bermaydi: avto-saqlashsiz ishlayveradi
  }
}

function parseLocalDraft(raw: string | null): LocalDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return typeof value?.form?.body === "string" ? value : null;
  } catch {
    return null;
  }
}

function formatSavedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Balandligi matnga qarab o'sadi. Uni yashirin nusxa (::after) belgilaydi, shuning uchun JS bilan o'lchash va scroll sakrashi yo'q.
// grid-cols-1 ustunni ekran kengligida ushlaydi: aks holda uzun havola telefonda maydonni ekrandan chiqarib yuboradi
function GrowingTextarea({ className = "", ...props }: React.ComponentProps<"textarea"> & { value: string }) {
  return (
    <div
      data-value={props.value}
      className={`grid grid-cols-1 after:invisible after:whitespace-pre-wrap after:break-words after:content-[attr(data-value)_'_'] after:[grid-area:1/1] ${className}`}
    >
      <textarea rows={1} {...props} className="resize-none overflow-hidden bg-transparent outline-none placeholder:text-gray-600 [grid-area:1/1]" />
    </div>
  );
}

function PreviewArticle({ form, preview, tags }: { form: PostForm; preview: Preview | null; tags: Tag[] }) {
  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-8 sm:mb-10">
        <PostInfo date={form.date} readingTime={preview?.readingTime ?? 1} draft={form.draft} />
        <h1 className="mt-2 text-balance text-3xl font-extrabold leading-tight text-white md:text-4xl">{form.title.trim() || "Untitled"}</h1>
      </header>
      {form.body.trim() ? <PostBody html={preview?.html ?? ""} /> : <p className="text-gray-500">Nothing to preview yet. Start writing in the editor.</p>}
      {tags.length > 0 && (
        <div inert className="mt-10 flex flex-wrap gap-2">
          {tags.map((tag) => <TagLink key={tag.slug} tag={tag} />)}
        </div>
      )}
    </article>
  );
}

function SaveState({ busy, dirty, isNew }: { busy: "save" | "delete" | null; dirty: boolean; isNew: boolean }) {
  const [icon, text, title] = busy
    ? [<LoaderCircle key="busy" className="size-3.5 animate-spin" />, busy === "delete" ? "Deleting…" : "Saving…", undefined]
    : dirty
      ? [<span key="dirty" className="size-2 rounded-full bg-amber-400" />, "Unsaved changes", "A copy is kept in this browser until you save"]
      : isNew
        ? [null, "Not saved yet", undefined]
        : [<Check key="saved" className="size-3.5" />, "Saved", undefined];

  return (
    <span title={title} className="flex items-center gap-1.5 text-xs text-gray-500">
      {icon}
      <span className="hidden sm:inline">{text}</span>
    </span>
  );
}

function Toast({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const { icon: Icon, className } = NOTICE_STYLES[notice.kind];
  return (
    <div
      role={notice.kind === "error" ? "alert" : "status"}
      className="fixed bottom-4 left-1/2 z-[60] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-start gap-3 rounded-xl border border-gray-700 bg-surface py-3 pl-4 pr-2 text-sm shadow-2xl shadow-black/50"
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${className}`} />
      <p className="min-w-0 text-gray-200">
        {notice.text}
        {notice.link && (
          <a href={notice.link.href} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold text-white underline underline-offset-2">
            {notice.link.label}
          </a>
        )}
      </p>
      <button onClick={onClose} aria-label="Dismiss" className="rounded p-0.5 text-gray-500 hover:text-white">
        <X className="size-4" />
      </button>
    </div>
  );
}

export default function PostEditor({ fileName, sha, slug: initialSlug, initial, tagSuggestions }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  // GitHub'dagi oxirgi saqlangan holat: sha keyingi saqlashda konfliktni aniqlaydi, form esa saqlanmagan o'zgarishlarni
  const [saved, setSaved] = useState({ fileName, sha, slug: initialSlug, draft: initial.draft, form: initial });
  // Yangi postda URL sarlavhadan yasaladi, qo'lda o'zgartirilsa shu qiymat ishlatiladi
  const [customSlug, setCustomSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [view, setView] = useState<View>("write");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishStep, setPublishStep] = useState<"confirm" | "done" | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNew = !saved.fileName;
  const isPublished = !isNew && !saved.draft;
  const slug = isNew ? (customSlug ?? slugify(form.title)) : (saved.slug ?? "");
  const dirty = !sameContent(form, saved.form);
  const tags = splitTags(form.tags).map((name) => ({ name, slug: slugify(name) }));

  // Sahifa ochilganda brauzerda shu post uchun saqlanmagan matn qolgan bo'lsa, uni tiklashni taklif qilamiz
  const draftKey = localDraftKey(saved.fileName);
  const storedDraft = useSyncExternalStore(subscribeToStorage, () => readStorage(draftKey), () => null);
  const localDraft = useMemo(() => parseLocalDraft(storedDraft), [storedDraft]);
  const showRestore = localDraft !== null && !dirty && !restoreDismissed && !sameContent(localDraft.form, form);

  // Cover berilmagan bo'lsa saytdagi kabi matndagi birinchi rasm olinadi
  const coverUrl = form.cover.trim() ? adminImageUrl(form.cover) : null;
  const firstImage = findFirstImage(form.body);
  const autoCoverUrl = firstImage ? adminImageUrl(firstImage) : null;
  const cover = coverUrl ? { url: coverUrl, source: "custom" as const } : !form.cover.trim() && autoCoverUrl ? { url: autoCoverUrl, source: "auto" as const } : null;

  const update = <K extends keyof PostForm>(key: K, value: PostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  // Jonli ko'rinish, so'zlar soni va avtomatik tavsif server'da sayt bilan bir xil pipeline orqali yasaladi
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
        if (response.ok) setPreview(await response.json());
      } catch {
        // Yangi matn kiritilganda eski so'rov bekor qilinadi
      }
    }, PREVIEW_DELAY);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.body]);

  // Saqlanmagan o'zgarishlar brauzerda saqlanib turadi
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      const draft: LocalDraft = { form, customSlug, sha: saved.sha, savedAt: Date.now() };
      writeStorage(draftKey, JSON.stringify(draft));
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [dirty, form, customSlug, saved.sha, draftKey]);

  // Saqlanmagan o'zgarishlar bilan sahifani yopishda brauzer ogohlantiradi
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Muvaffaqiyat xabarlari o'zi yo'qoladi, xatolar yopilguncha turadi
  useEffect(() => {
    if (notice?.kind !== "success") return;
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION);
    return () => clearTimeout(timer);
  }, [notice]);

  // Esc avval Publish oynasini, keyin sozlamalar panelini yopadi
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (publishStep) {
        if (!busy) setPublishStep(null);
      } else {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [publishStep, busy]);

  // Belgilangan matnni almashtiradi. execCommand Ctrl+Z tarixini saqlaydi, ishlamasa qiymat to'g'ridan-to'g'ri o'zgartiriladi
  const replaceSelection = (text: string, selectFrom = text.length, selectTo = selectFrom) => {
    const textarea = bodyRef.current;
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
    const textarea = bodyRef.current;
    if (!textarea) return;
    const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || placeholder;
    replaceSelection(before + selected + after, before.length, before.length + selected.length);
  };

  // Joriy qator boshiga belgi qo'yadi: sarlavha, ro'yxat, iqtibos
  const prefixLine = (prefix: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const lineStart = textarea.value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart);
    replaceSelection(prefix);
  };

  const toolGroups: { icon: LucideIcon; title: string; run: () => void }[][] = [
    [
      { icon: Bold, title: "Bold (Ctrl+B)", run: () => wrap("**", "**", "bold text") },
      { icon: Italic, title: "Italic (Ctrl+I)", run: () => wrap("*", "*", "italic text") },
      { icon: Heading2, title: "Heading", run: () => prefixLine("## ") },
    ],
    [
      { icon: Quote, title: "Quote", run: () => prefixLine("> ") },
      { icon: List, title: "Bulleted list", run: () => prefixLine("- ") },
      { icon: ListOrdered, title: "Numbered list", run: () => prefixLine("1. ") },
    ],
    [
      { icon: LinkIcon, title: "Link (Ctrl+K)", run: () => wrap("[", "](https://)", "link text") },
      { icon: Code, title: "Inline code", run: () => wrap("`", "`", "code") },
      { icon: SquareCode, title: "Code block", run: () => wrap("\n```python\n", "\n```\n", "print('hello')") },
    ],
    [
      { icon: Pi, title: "Inline formula", run: () => wrap("$", "$", "x^2") },
      { icon: Sigma, title: "Formula block", run: () => wrap("\n$$\n", "\n$$\n", "E = mc^2") },
      { icon: Table, title: "Table", run: () => replaceSelection("\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n") },
    ],
    [{ icon: ImagePlus, title: "Image (you can also paste or drop it into the text)", run: () => fileInputRef.current?.click() }],
  ];

  const uploadImage = async (file: File) => {
    const image = await prepareImage(file, slug || "image");
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: image.name, data: image.data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return { alt: image.baseName, path: String(result.markdownPath) };
  };

  const insertImages = async (files: File[]) => {
    for (const file of files.filter((item) => item.type.startsWith("image/"))) {
      setNotice({ kind: "info", text: `Uploading ${file.name || "image"}…` });
      try {
        const image = await uploadImage(file);
        replaceSelection(`![${image.alt}](${image.path})\n`);
        setNotice({ kind: "success", text: "Image uploaded" });
      } catch (error) {
        setNotice({ kind: "error", text: `Image upload failed: ${errorMessage(error)}` });
      }
    }
  };

  const uploadCover = async (file: File) => {
    setNotice({ kind: "info", text: "Uploading cover…" });
    try {
      update("cover", (await uploadImage(file)).path);
      setNotice({ kind: "success", text: "Cover uploaded" });
    } catch (error) {
      setNotice({ kind: "error", text: `Cover upload failed: ${errorMessage(error)}` });
    }
  };

  const requireTitle = () => {
    if (form.title.trim()) return true;
    setNotice({ kind: "error", text: "Add a title first" });
    titleRef.current?.focus();
    return false;
  };

  // draft: true qoralama sifatida saqlaydi (e'lon qilingan postni saytdan oladi), false saytga chiqaradi
  const save = async (draft: boolean) => {
    if (busy || !requireTitle()) return false;

    // So'rov ketayotganda yozilgan matn keyingi saqlashgacha "saqlanmagan" bo'lib qoladi
    const submitted = { ...form, draft };
    const wasPublished = isPublished;
    setBusy("save");
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ fileName: saved.fileName, sha: saved.sha, wasDraft: saved.draft, slug, form: submitted }),
      });
      const result = await response.json();
      if (response.status === 401) {
        setNotice({ kind: "error", text: result.error, link: { href: "/admin/login", label: "Sign in (new tab)" } });
        return false;
      }
      if (!response.ok) throw new Error(result.error);

      setForm((current) => ({ ...current, draft }));
      setSaved({ fileName: result.fileName, sha: result.sha, slug: result.slug, draft, form: submitted });
      writeStorage(draftKey, null);
      // Sahifani qayta yuklamasdan manzilni tahrirlash sahifasiga almashtiramiz
      if (isNew) window.history.replaceState(null, "", `/admin/edit/${encodeURIComponent(result.fileName)}`);

      // Birinchi marta e'lon qilish natijasi Publish oynasida ko'rsatiladi
      if (draft) {
        setNotice({ kind: "success", text: wasPublished ? "Unpublished. The post will disappear from the site in about a minute." : "Draft saved. It is not visible on the site." });
      } else if (wasPublished) {
        setNotice({ kind: "success", text: "Updated. The site will refresh in about a minute.", link: { href: `/posts/${result.slug}`, label: "View post ↗" } });
      }
      return true;
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!saved.fileName || !saved.sha || busy) return;
    if (!window.confirm(`Delete "${form.title || saved.fileName}"? This cannot be undone here.`)) return;

    setBusy("delete");
    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ fileName: saved.fileName, sha: saved.sha, title: form.title, wasDraft: saved.draft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      writeStorage(draftKey, null);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
      setBusy(null);
    }
  };

  const restoreLocalDraft = () => {
    if (!localDraft) return;
    // Holat va forma ko'rsatmaydigan maydonlar fayldagi joriy qiymatda qoladi
    setForm((current) => ({ ...localDraft.form, draft: current.draft, extra: current.extra }));
    if (isNew) setCustomSlug(localDraft.customSlug);
  };

  const discardLocalDraft = () => {
    writeStorage(draftKey, null);
    setRestoreDismissed(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      save(form.draft);
    } else if (event.target === bodyRef.current && (key === "b" || key === "i" || key === "k")) {
      event.preventDefault();
      if (key === "b") wrap("**", "**", "bold text");
      else if (key === "i") wrap("*", "*", "italic text");
      else wrap("[", "](https://)", "link text");
    }
  };

  // Sarlavha va tavsif bir qatorli: Enter keyingi maydonga o'tkazadi, qo'yilgan matndagi qator tashlanishlari bo'shliqqa aylanadi
  const singleLine = (next: React.RefObject<HTMLTextAreaElement | null>) => ({
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      next.current?.focus();
      if (next === bodyRef) next.current?.setSelectionRange(0, 0);
    },
  });

  return (
    <div onKeyDown={handleKeyDown}>
      <CodeCopyButtons />

      <header className="sticky top-0 z-30 h-14 border-b border-gray-700/50 bg-background/90 backdrop-blur">
        <div className="flex h-full items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <Link href="/admin" aria-label="All posts" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Posts</span>
          </Link>
          <span className="h-5 w-px bg-gray-700/70" />
          <span
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${isPublished ? "bg-green-500/10 text-green-400" : isNew ? "bg-white/5 text-gray-300" : "bg-amber-400/10 text-amber-300"}`}
          >
            {isNew ? "New" : isPublished ? "Published" : "Draft"}
          </span>
          <SaveState busy={busy} dirty={dirty} isNew={isNew} />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {preview && (
              <span className="mr-1 hidden text-xs tabular-nums text-gray-500 md:inline">
                {preview.words.toLocaleString("en-US")} words · {preview.readingTime} min read
              </span>
            )}
            <div className="flex rounded-lg bg-surface p-0.5">
              {VIEWS.map(({ id, label, icon: Icon, className = "flex" }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  title={label}
                  aria-label={label}
                  aria-pressed={view === id}
                  className={`${className} size-8 items-center justify-center rounded-md transition ${view === id ? "bg-background text-white shadow" : "text-gray-500 hover:text-white"}`}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setSettingsOpen((open) => !open)}
              title="Post settings"
              aria-label="Post settings"
              aria-expanded={settingsOpen}
              className={`flex size-9 items-center justify-center rounded-lg transition ${settingsOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Settings2 className="size-[18px]" />
            </button>
            {!isPublished && (
              <button
                onClick={() => save(true)}
                disabled={busy !== null}
                title="Save as draft (Ctrl+S)"
                className="hidden rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-200 hover:border-gray-400 hover:text-white disabled:opacity-50 transition sm:block"
              >
                Save
              </button>
            )}
            <button
              onClick={() => (isPublished ? save(false) : requireTitle() && setPublishStep("confirm"))}
              disabled={busy !== null}
              title={isPublished ? "Save changes to the live post (Ctrl+S)" : undefined}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-background hover:bg-gray-200 disabled:opacity-50 transition sm:px-4"
            >
              {isPublished ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <div className={`transition-[padding] duration-200 ${settingsOpen ? "lg:pr-96" : ""}`}>
        <div className={view === "split" ? "lg:grid lg:grid-cols-2" : ""}>
          {/* Ko'rinish rejimida ham maydon o'chirilmaydi, aks holda Ctrl+Z tarixi va kursor joyi yo'qoladi */}
          <div className={`${view === "preview" ? "hidden" : ""} mx-auto w-full max-w-3xl px-4 pb-40 sm:px-8`}>
            <div className="sticky top-14 z-20 -mx-4 flex items-center gap-0.5 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:px-8">
              {toolGroups.map((group, index) => (
                <div key={index} className="flex shrink-0 items-center gap-0.5">
                  {index > 0 && <span className="mx-1 h-5 w-px bg-gray-700/70" />}
                  {group.map(({ icon: Icon, title, run }) => (
                    <button
                      key={title}
                      type="button"
                      title={title}
                      aria-label={title}
                      onClick={run}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
                    >
                      <Icon className="size-[18px]" />
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {showRestore && localDraft && (
              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm sm:flex-row sm:items-center">
                <History className="hidden size-5 shrink-0 text-amber-300 sm:block" />
                <p className="flex-1 text-gray-300">
                  Unsaved changes from {formatSavedAt(localDraft.savedAt)} were found in this browser.
                  {localDraft.sha !== saved.sha && " The post was changed on GitHub after that."}
                </p>
                <div className="flex shrink-0 gap-2">
                  <button onClick={discardLocalDraft} className="rounded-lg px-3 py-1.5 font-semibold text-gray-400 hover:bg-white/5 hover:text-white transition">
                    Discard
                  </button>
                  <button onClick={restoreLocalDraft} className="rounded-lg bg-amber-300 px-3 py-1.5 font-bold text-background hover:bg-amber-200 transition">
                    Restore
                  </button>
                </div>
              </div>
            )}

            <GrowingTextarea
              ref={titleRef}
              value={form.title}
              onChange={(event) => update("title", event.target.value.replace(/\n/g, " "))}
              {...singleLine(descriptionRef)}
              placeholder="Post title"
              aria-label="Title"
              className="mt-10 font-serif text-4xl font-bold leading-tight sm:text-5xl"
            />
            <GrowingTextarea
              ref={descriptionRef}
              value={form.description}
              onChange={(event) => update("description", event.target.value.replace(/\n/g, " "))}
              {...singleLine(bodyRef)}
              placeholder="Add a short description…"
              aria-label="Description"
              className="mt-4 font-serif text-xl leading-snug text-gray-400"
            />
            <GrowingTextarea
              ref={bodyRef}
              value={form.body}
              onChange={(event) => update("body", event.target.value)}
              onPaste={(event) => {
                const files = Array.from(event.clipboardData.files);
                if (files.some((file) => file.type.startsWith("image/"))) {
                  event.preventDefault();
                  insertImages(files);
                }
              }}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) event.preventDefault();
              }}
              onDrop={(event) => {
                const files = Array.from(event.dataTransfer.files);
                if (files.length > 0) {
                  event.preventDefault();
                  insertImages(files);
                }
              }}
              placeholder="Start writing in Markdown. Paste or drop images right here."
              aria-label="Post text"
              spellCheck={false}
              className="mt-8 min-h-[50vh] font-serif text-lg leading-8 text-gray-200"
            />
          </div>

          {view !== "write" && (
            <div
              className={
                view === "split"
                  ? "sticky top-14 hidden h-[calc(100vh-3.5rem)] self-start overflow-y-auto border-l border-gray-700/50 px-6 py-10 lg:block xl:px-10"
                  : "px-4 py-10 sm:px-6 sm:py-14"
              }
            >
              <PreviewArticle form={form} preview={preview} tags={tags} />
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          insertImages(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <SettingsPanel
        open={settingsOpen}
        form={form}
        slug={slug}
        isNew={isNew}
        isPublished={isPublished}
        busy={busy !== null}
        tagSuggestions={tagSuggestions}
        cover={cover}
        onChange={update}
        onSlugChange={setCustomSlug}
        onUploadCover={uploadCover}
        onUnpublish={() => save(true)}
        onDelete={remove}
        onClose={() => setSettingsOpen(false)}
      />

      {publishStep && (
        <PublishDialog
          step={publishStep}
          busy={busy !== null}
          post={{
            slug,
            title: form.title.trim(),
            date: form.date,
            description: form.description.trim() || preview?.excerpt || "",
            tags,
            imageUrl: cover?.url ?? null,
            draft: false,
            readingTime: preview?.readingTime ?? 1,
          }}
          hasDescription={form.description.trim() !== ""}
          coverSource={cover?.source ?? "none"}
          onConfirm={async () => {
            if (await save(false)) setPublishStep("done");
          }}
          onClose={() => setPublishStep(null)}
        />
      )}

      {notice && <Toast notice={notice} onClose={() => setNotice(null)} />}
    </div>
  );
}
