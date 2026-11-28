"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Rocket, X } from "lucide-react";
import { BUILD_WINDOW_MS } from "@/lib/admin/commits";
import type { DeployStatus } from "@/lib/admin/deploy";

// Build ketayotganda holat shu oraliqda qayta so'raladi: tugagach tugma o'zi "Live" bo'ladi
const POLL_INTERVAL = 20_000;
const VISIBLE_CHANGES = 8;
// Tugma bosilgan vaqt brauzerda saqlanadi: sahifa yangilansa ham qayta bosib, ikkinchi build boshlab yuborilmasin
const STORAGE_KEY = "blog-admin:deploy";

type Triggered = { at: number; head: string | null };
type State = "loading" | "error" | "setup" | "live" | "deploying" | "pending";

function readTriggered(): Triggered | null {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return typeof value?.at === "number" ? value : null;
  } catch {
    return null;
  }
}

function writeTriggered(value: Triggered | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Brauzer saqlashga ruxsat bermasa, himoya faqat shu sahifa ochiq turganda ishlaydi
  }
}

async function fetchStatus(): Promise<DeployStatus> {
  const response = await fetch("/api/admin/deploy", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

function stateOf(status: DeployStatus, triggered: Triggered | null, clock: number): State {
  if (status.known && status.changes.length === 0) return "live";
  if (!status.configured) return "setup";
  const ownBuild = triggered !== null && clock - triggered.at < BUILD_WINDOW_MS && triggered.head === status.head;
  if (ownBuild || (status.buildingSince && !status.needsDeploy)) return "deploying";
  return "pending";
}

export default function DeployButton() {
  const [status, setStatus] = useState<DeployStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [triggered, setTriggered] = useState<Triggered | null>(null);
  // Oxirgi so'rov vaqti: build oynasi tugaganini shunga qarab bilamiz
  const [clock, setClock] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    () =>
      fetchStatus().then(
        (result) => {
          const stored = readTriggered();
          // Sayt yangilangan bo'lsa, eski belgi kerak emas
          const live = result.known && result.changes.length === 0;
          if (stored && live) writeTriggered(null);
          setTriggered(live ? null : stored);
          setStatus(result);
          setLoadError(null);
          setClock(Date.now());
        },
        (error) => {
          setLoadError(error instanceof Error ? error.message : String(error));
          setClock(Date.now());
        },
      ),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const state: State = status ? stateOf(status, triggered, clock) : loadError ? "error" : "loading";

  useEffect(() => {
    if (state !== "deploying") return;
    const timer = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [state, load]);

  // Panel tashqarisiga bosilganda yoki Esc bilan yopiladi
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const deploy = async () => {
    if (busy) return;
    setBusy(true);
    setDeployError(null);
    try {
      const response = await fetch("/api/admin/deploy", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const value = { at: Date.now(), head: status?.head ?? null };
      writeTriggered(value);
      setTriggered(value);
      setClock(value.at);
      setOpen(false);
    } catch (error) {
      setDeployError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const changes = status?.changes ?? [];
  const pendingCount = changes.length;

  const button = {
    loading: { icon: <Rocket className="size-4" />, label: "Deploy", className: "border-gray-700 text-gray-500" },
    error: { icon: <CircleAlert className="size-4 text-red-400" />, label: "Deploy", className: "border-gray-700 text-gray-300 hover:border-gray-400" },
    setup: { icon: <Rocket className="size-4" />, label: "Deploy", className: "border-gray-700 text-gray-300 hover:border-gray-400" },
    live: { icon: <CircleCheck className="size-4 text-green-400" />, label: "Live", className: "border-gray-700 text-gray-300 hover:border-gray-400" },
    deploying: { icon: <LoaderCircle className="size-4 animate-spin" />, label: "Deploying…", className: "border-accent/40 text-accent" },
    pending: { icon: <Rocket className="size-4" />, label: "Deploy", className: "border-amber-400/50 text-amber-200 hover:border-amber-300 hover:text-amber-100" },
  }[state];

  const title = {
    loading: "Checking what is live…",
    error: "Could not check what is live",
    setup: "Deploying from here is not set up yet",
    live: "The site shows the latest saved version",
    deploying: "The site is being rebuilt",
    pending: "Some saved changes are not on the site yet",
  }[state];

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        disabled={state === "loading"}
        title={title}
        aria-label={`${button.label}${pendingCount > 0 && state !== "live" ? `, ${pendingCount} changes not live` : ""}`}
        aria-expanded={open}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-sm font-semibold transition ${button.className}`}
      >
        {button.icon}
        <span className="hidden sm:inline">{button.label}</span>
        {(state === "pending" || state === "setup") && pendingCount > 0 && (
          <span className="min-w-5 rounded-full bg-amber-400/15 px-1.5 text-xs tabular-nums text-amber-200">{status?.more ? `${pendingCount}+` : pendingCount}</span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Deploy the site"
          className="z-40 rounded-2xl border border-gray-700 bg-surface p-4 text-sm shadow-2xl shadow-black/50 max-sm:fixed max-sm:inset-x-4 max-sm:top-16 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-bold text-white">
              {state === "live" ? "The site is up to date" : state === "deploying" ? "Deploying…" : state === "error" ? "Could not check the site" : "Not live yet"}
            </p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="-m-1 rounded p-1 text-gray-500 hover:text-white">
              <X className="size-4" />
            </button>
          </div>

          {state === "error" ? (
            <>
              <p className="mt-2 text-red-300">{loadError}</p>
              <button onClick={load} className="mt-4 rounded-lg border border-gray-600 px-3 py-1.5 font-semibold text-gray-200 hover:border-white hover:text-white transition">
                Try again
              </button>
            </>
          ) : state === "live" ? (
            <p className="mt-2 text-gray-400">Every saved change is on the site. Nothing to deploy.</p>
          ) : (
            <>
              {status && !status.known && <p className="mt-2 text-gray-400">The live version is unknown here (local dev). Deploy builds the latest version from GitHub.</p>}
              {changes.length > 0 && (
                <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto">
                  {changes.slice(-VISIBLE_CHANGES).map((change) => (
                    <li key={change.label} className="flex gap-2 text-gray-300">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-300" />
                      <span className="min-w-0 flex-1 break-words">{change.label}</span>
                      {change.count > 1 && <span className="shrink-0 text-xs tabular-nums text-gray-500">×{change.count}</span>}
                    </li>
                  ))}
                  {(changes.length > VISIBLE_CHANGES || status?.more) && (
                    <li className="pl-3.5 text-xs text-gray-500">
                      {status?.more ? "and more (over 100 commits since the last deploy)" : `and ${changes.length - VISIBLE_CHANGES} more`}
                    </li>
                  )}
                </ul>
              )}

              {state === "deploying" ? (
                <p className="mt-3 text-gray-400">The site usually updates within a couple of minutes. This button turns into “Live” when it is done.</p>
              ) : state === "setup" ? (
                <p className="mt-3 text-gray-400">
                  To deploy from here, add <code className="text-gray-200">NETLIFY_BUILD_HOOK</code> in Netlify → Site configuration → Environment variables. Use the build hook URL
                  from Build &amp; deploy → Build hooks, then deploy the site once.
                </p>
              ) : (
                <>
                  {status?.buildingSince && <p className="mt-3 text-gray-400">A deploy for an earlier change is running, but it does not include the latest edits.</p>}
                  <p className="mt-3 text-xs text-gray-500">Takes about a minute. Each deploy uses 15 of the 300 monthly credits on the Netlify free plan (about 20 deploys a month).</p>
                  {deployError && <p className="mt-3 text-red-300">{deployError}</p>}
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setOpen(false)} disabled={busy} className="rounded-lg px-3 py-1.5 font-semibold text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50 transition">
                      Cancel
                    </button>
                    <button
                      onClick={deploy}
                      disabled={busy}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-bold text-background hover:bg-gray-200 disabled:opacity-70 transition"
                    >
                      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                      {busy ? "Starting…" : "Deploy now"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
