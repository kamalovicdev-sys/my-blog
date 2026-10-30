"use client";
import { useState } from "react";
import { X } from "lucide-react";

const MAX_SUGGESTIONS = 8;

// Formada teglar "linux, python" ko'rinishidagi matn bo'lib saqlanadi
export function splitTags(value: string) {
  return value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean);
}

// Teg yozib Enter (yoki vergul) bosiladi, × bilan o'chiriladi. Avval ishlatilgan teglar taklif qilinadi
export default function TagInput({ value, onChange, suggestions }: { value: string; onChange: (value: string) => void; suggestions: string[] }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  // Strelkalar bilan tanlangan taklif, -1 bo'lsa yozilgan matn qo'shiladi
  const [active, setActive] = useState(-1);

  const tags = splitTags(value);
  const taken = new Set(tags.map((tag) => tag.toLowerCase()));
  const query = text.trim().replace(/^#/, "").toLowerCase();
  const matches = suggestions.filter((tag) => !taken.has(tag.toLowerCase()) && tag.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS);

  const add = (...names: string[]) => {
    const next = [...tags];
    for (const name of names.map((item) => item.trim().replace(/^#/, ""))) {
      if (name && !next.some((tag) => tag.toLowerCase() === name.toLowerCase())) next.push(name);
    }
    if (next.length !== tags.length) onChange(next.join(", "));
    setText("");
    setActive(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && matches[active]) add(matches[active]);
      else add(text);
    } else if (event.key === "Backspace" && !text && tags.length > 0) {
      onChange(tags.slice(0, -1).join(", "));
    } else if (event.key === "ArrowDown" && matches.length > 0) {
      event.preventDefault();
      setActive((current) => (current + 1) % matches.length);
    } else if (event.key === "ArrowUp" && matches.length > 0) {
      event.preventDefault();
      setActive((current) => (current <= 0 ? matches.length : current) - 1);
    } else if (event.key === "Escape" && active >= 0) {
      // Panel yopilmasin, faqat tanlov bekor qilinsin
      event.stopPropagation();
      setActive(-1);
    }
  };

  return (
    <div className="relative">
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-gray-700 bg-background px-2 py-1.5 focus-within:border-gray-400 transition">
        {tags.map((tag, index) => (
          <span key={`${index}:${tag}`} className="flex items-center gap-1 rounded-full bg-surface py-0.5 pl-2.5 pr-1 text-sm text-gray-200 ring-1 ring-gray-700">
            #{tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, i) => i !== index).join(", "))}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 text-gray-500 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(event) => {
            // Vergul bilan bir nechta teg yozilsa yoki qo'yilsa, oxirgisidan boshqalari darhol chip bo'ladi
            const parts = event.target.value.split(",");
            if (parts.length > 1) {
              add(...parts.slice(0, -1));
              setText(parts[parts.length - 1]);
            } else {
              setText(event.target.value);
              setActive(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (text.trim()) add(text);
          }}
          placeholder={tags.length === 0 ? "Add a tag…" : ""}
          aria-label="Add tag"
          className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-gray-500"
        />
      </div>

      {focused && matches.length > 0 && (
        <ul role="listbox" className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-700 bg-surface p-1 shadow-xl shadow-black/40">
          {matches.map((tag, index) => (
            <li key={tag} role="option" aria-selected={index === active}>
              <button
                type="button"
                // Bosilganda maydon fokusni yo'qotmasin, aks holda onBlur yozilgan matnni teg qilib qo'yadi
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(tag)}
                className={`w-full rounded-md px-2.5 py-1.5 text-left text-sm transition ${index === active ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5"}`}
              >
                #{tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
