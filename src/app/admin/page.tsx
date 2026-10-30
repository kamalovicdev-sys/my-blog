import Link from "next/link";
import { CircleAlert, TriangleAlert } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import PostList from "@/components/admin/PostList";
import Logo from "@/components/Logo";
import { GitHubError } from "@/lib/admin/github";
import { listPosts } from "@/lib/admin/posts";
import { getAdminSession, getMissingEnv } from "@/lib/admin/session";

// /admin/callback xatolarni shu kodlar bilan qaytaradi
const SIGN_IN_ERRORS: Record<string, string> = {
  state: "The sign-in link expired or was opened in another tab. Please try again.",
  credentials: "GitHub rejected the app credentials. Check GITHUB_APP_CLIENT_ID and GITHUB_APP_CLIENT_SECRET in Netlify, then redeploy.",
  redirect: "The callback URL is not registered in the GitHub App. Add https://blog.kamalovic.uz/admin/callback to its callback URLs.",
  code: "The GitHub sign-in code expired. Please try again.",
  account: "This GitHub account is not allowed to use the admin panel.",
  github: "GitHub sign-in failed. Please try again.",
};

// Kirish va sozlash sahifalari: ekran o'rtasidagi bitta kartochka
function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold tracking-wider">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-gray-700/70 bg-surface p-8 shadow-2xl shadow-black/30">{children}</div>
    </div>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function SignIn({ message, error }: { message?: string; error?: string }) {
  return (
    <CenteredCard>
      <h1 className="text-center text-xl font-bold">Sign in to admin</h1>
      <p className="mt-2 text-center text-sm text-gray-400">{message ?? "Write, edit and publish posts from your browser."}</p>
      {error && (
        <p className="mt-6 flex gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <a href="/admin/login" className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 font-bold text-background hover:bg-gray-200 transition">
        <GitHubMark className="size-5" />
        Continue with GitHub
      </a>
    </CenteredCard>
  );
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const missingEnv = getMissingEnv();
  if (missingEnv.length > 0) {
    return (
      <CenteredCard>
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <TriangleAlert className="size-5 text-amber-400" />
          Admin panel is not configured
        </h1>
        <p className="mt-2 text-sm text-gray-400">Set these environment variables (Netlify → Site configuration → Environment variables, or .env.local) and redeploy:</p>
        <ul className="mt-4 space-y-1 rounded-lg bg-background p-3 font-mono text-sm text-amber-300">
          {missingEnv.map((name) => <li key={name}>{name}</li>)}
        </ul>
      </CenteredCard>
    );
  }

  const session = await getAdminSession();
  if (!session) {
    const { error } = await searchParams;
    return <SignIn error={error ? (SIGN_IN_ERRORS[error] ?? SIGN_IN_ERRORS.github) : undefined} />;
  }

  let posts;
  try {
    posts = await listPosts(session.accessToken);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 401) return <SignIn message="Your session has expired. Sign in again." />;
    throw error;
  }

  return (
    <>
      <AdminHeader login={session.login} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <PostList posts={posts} />
      </main>
    </>
  );
}
