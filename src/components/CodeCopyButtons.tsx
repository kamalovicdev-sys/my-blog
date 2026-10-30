"use client";
import { useEffect } from "react";

// Kod bloklaridagi "Copy" tugmalari build paytida HTML'ga qo'shiladi (lib/markdown.ts),
// bu komponent esa ularning bosilishini ishlaydi
export default function CodeCopyButtons() {
  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("[data-copy-code]");
      const code = button?.parentElement?.querySelector("pre")?.textContent;
      if (!button || code == null) return;

      await navigator.clipboard.writeText(code);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
