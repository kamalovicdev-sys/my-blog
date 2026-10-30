import { SOCIAL } from "@/lib/site";

const footerLinks = [
  { label: "GitHub", href: SOCIAL.github },
  { label: "Telegram", href: SOCIAL.telegram },
  { label: "Portfolio", href: SOCIAL.portfolio },
];

export default function SiteFooter() {
  return (
    <footer className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-12 border-t border-gray-700/50 text-center flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
      {footerLinks.map(({ label, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">{label}</a>
      ))}
      <a href="/rss.xml" className="text-gray-400 hover:text-white transition">RSS</a>
    </footer>
  );
}
