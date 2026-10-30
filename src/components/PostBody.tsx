// Post matni: sayt sahifasida ham, admin paneldagi jonli ko'rinishda ham bir xil stil bilan chiqadi
export default function PostBody({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg prose-invert prose-slate max-w-none break-words font-serif prose-headings:font-sans prose-h2:text-2xl prose-h3:text-xl prose-img:mx-auto prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
