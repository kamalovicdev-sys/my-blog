"use client";
import { useState, useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

const buttonClass =
  "px-4 py-2 rounded-lg border border-gray-600 text-sm font-semibold text-gray-200 hover:border-white hover:text-white transition";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  // Telefon brauzerlarida tizimning o'z "Share" oynasi bor; server render paytida u yo'q deb hisoblanadi
  const canShare = useSyncExternalStore(subscribeNoop, () => typeof navigator.share === "function", () => false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "X", href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-700/50">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Share this post</h3>
      <div className="flex flex-wrap gap-2">
        {canShare && (
          <button onClick={() => navigator.share({ title, url })} className={buttonClass}>
            Share…
          </button>
        )}
        {links.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            {label}
          </a>
        ))}
        <button onClick={handleCopy} className={buttonClass}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
