"use client";

export default function ShareButtons({ slug }: { slug: string }) {
  const handleCopy = () => {
    const url = `${window.location.origin}/posts/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-700/50">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Share this post</h3>
      <button 
        onClick={handleCopy}
        className="px-6 py-2 bg-white text-[#17212d] rounded-lg font-bold hover:bg-gray-200 transition"
      >
        Copy Link
      </button>
    </div>
  );
}