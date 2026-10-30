"use client";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

// Ekran tepasidan shuncha piksel o'tgan oxirgi sarlavha faol hisoblanadi
const ACTIVE_OFFSET = 120;

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const passed = items.filter((item) => {
        const heading = document.getElementById(item.id);
        return heading && heading.getBoundingClientRect().top < ACTIVE_OFFSET;
      });
      setActiveId(passed.at(-1)?.id ?? null);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [items]);

  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
          <a
            href={`#${item.id}`}
            className={`block leading-snug transition ${item.id === activeId ? "text-accent" : "text-gray-400 hover:text-white"}`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
