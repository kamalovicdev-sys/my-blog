"use client";
import { useEffect, useRef } from "react";
import { GISCUS } from "@/lib/site";

// GitHub Discussions asosidagi izohlar. lib/site.ts'da categoryId berilmaguncha hech narsa ko'rsatilmaydi
export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !GISCUS.categoryId) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    const attributes = {
      repo: GISCUS.repo,
      "repo-id": GISCUS.repoId,
      category: GISCUS.category,
      "category-id": GISCUS.categoryId,
      mapping: "pathname",
      strict: "1",
      "reactions-enabled": "1",
      "emit-metadata": "0",
      "input-position": "top",
      theme: "transparent_dark",
      lang: "en",
      loading: "lazy",
    };
    for (const [name, value] of Object.entries(attributes)) {
      script.setAttribute(`data-${name}`, value);
    }
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  if (!GISCUS.categoryId) return null;
  return <section ref={containerRef} className="mt-12" />;
}
