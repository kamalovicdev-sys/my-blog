"use client";
import { useEffect, useState } from "react";
import { SOCIAL } from "@/lib/site";

const links = [
  { label: "Telegram channel", href: SOCIAL.telegramChannel },
  { label: "RSS feed", href: "/rss.xml" },
  { label: "GitHub", href: SOCIAL.github },
  { label: "Website", href: SOCIAL.portfolio },
];

export default function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Oyna ochiq paytida orqadagi sahifa scroll bo'lmaydi va Esc bilan yopiladi
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-white text-background rounded-lg font-bold hover:bg-gray-200 transition"
      >
        Subscribe
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(event) => event.target === event.currentTarget && setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-title"
            className="bg-surface p-8 rounded-3xl border border-gray-700 w-full max-w-sm shadow-2xl"
          >
            <h2 id="subscribe-title" className="text-2xl font-bold mb-2 text-white text-center tracking-tight">Stay updated</h2>
            <p className="text-sm text-gray-400 text-center mb-8">Get new posts on Telegram or in your RSS reader.</p>
            <div className="space-y-4">
              {links.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("/") ? undefined : "_blank"}
                  rel={href.startsWith("/") ? undefined : "noopener noreferrer"}
                  className="flex items-center justify-center w-full py-3 bg-background border border-gray-600 rounded-xl hover:border-white transition-all hover:translate-x-1"
                >
                  {label}
                </a>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-8 w-full text-gray-500 hover:text-gray-300 text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
