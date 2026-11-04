import { SOCIAL } from "@/lib/site";

const footerLinks = [
  { label: "GitHub", href: SOCIAL.github },
  { label: "Telegram", href: SOCIAL.telegram },
  { label: "Portfolio", href: SOCIAL.portfolio },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line-strong">
      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-x-7 gap-y-3 px-4 py-7 font-mono text-xs font-bold uppercase tracking-[0.1em] sm:px-6">
        <span className="text-faint">© {new Date().getFullYear()} Kamalovic</span>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
          {footerLinks.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-white">
              {label}
            </a>
          ))}
          <a href="/rss.xml" className="text-muted transition hover:text-white">RSS</a>
        </nav>
      </div>
    </footer>
  );
}
