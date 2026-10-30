import Link from "next/link";
import { formatDate } from "@/lib/date";
import { GitHubError, listFiles } from "@/lib/admin/github";
import { isPostFileName, POSTS_DIRECTORY } from "@/lib/admin/post-file";
import { getAdminSession, getMissingEnv } from "@/lib/admin/session";
import { parsePost } from "@/lib/posts";

type PostRow =
  | { fileName: string; ok: true; title: string; date: string; slug: string; draft: boolean }
  | { fileName: string; ok: false; error: string };

// GitHub'dagi fayllar: build'ni kutmasdan eng oxirgi holat ko'rinadi
function toRow(fileName: string, text: string | null): PostRow {
  try {
    const post = parsePost(fileName, text ?? "");
    if (!post) return { fileName, ok: false, error: "No frontmatter" };
    const { title, date, slug, draft } = post.meta;
    return { fileName, ok: true, title, date, slug, draft };
  } catch (error) {
    return { fileName, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function SignIn({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-sm mt-16 rounded-2xl border border-gray-700 bg-surface p-8 text-center">
      <h1 className="text-2xl font-bold">Blog admin</h1>
      <p className="mt-2 text-sm text-gray-400">{message ?? "Sign in with your GitHub account to write and publish posts."}</p>
      <a href="/admin/login" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-background hover:bg-gray-200 transition">
        Sign in with GitHub
      </a>
    </div>
  );
}

export default async function AdminHome() {
  const missingEnv = getMissingEnv();
  if (missingEnv.length > 0) {
    return (
      <div className="mx-auto max-w-lg mt-16 rounded-2xl border border-amber-500/40 bg-surface p-8">
        <h1 className="text-xl font-bold">Admin panel is not configured</h1>
        <p className="mt-2 text-sm text-gray-400">Set these environment variables (Netlify → Site configuration → Environment variables, or .env.local) and redeploy:</p>
        <ul className="mt-4 space-y-1 font-mono text-sm text-amber-300">
          {missingEnv.map((name) => <li key={name}>{name}</li>)}
        </ul>
      </div>
    );
  }

  const session = await getAdminSession();
  if (!session) return <SignIn />;

  let files;
  try {
    files = await listFiles(session.accessToken, POSTS_DIRECTORY);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 401) return <SignIn message="Your session has expired. Sign in again." />;
    throw error;
  }

  const rows = files
    .filter((file) => isPostFileName(file.name))
    .map((file) => toRow(file.name, file.text))
    .sort((a, b) => (b.ok ? b.date : "").localeCompare(a.ok ? a.date : ""));

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Posts</h1>
          <p className="text-sm text-gray-400 mt-1">
            {rows.length} posts · signed in as {session.login}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-gray-700/50 rounded-xl border border-gray-700/50">
        {rows.map((row) => (
          <li key={row.fileName} className="flex items-center gap-4 px-4 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/edit/${encodeURIComponent(row.fileName)}`} className="block truncate font-semibold hover:text-accent transition">
                {row.ok ? row.title : row.fileName}
              </Link>
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {row.ok ? `${formatDate(row.date)} · /posts/${row.slug}` : <span className="text-red-400">{row.error}</span>}
              </p>
            </div>
            {row.ok && (
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.draft ? "bg-amber-400/10 text-amber-300" : "bg-green-500/10 text-green-400"}`}>
                {row.draft ? "Draft" : "Published"}
              </span>
            )}
            {row.ok && !row.draft && (
              <a href={`/posts/${row.slug}`} target="_blank" rel="noopener noreferrer" className="hidden sm:inline shrink-0 text-sm text-gray-400 hover:text-white transition">
                View ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
