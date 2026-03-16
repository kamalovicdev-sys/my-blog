"use client";
import { useState } from "react";

export default function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-white text-[#17212d] rounded-lg font-bold hover:bg-gray-200 transition"
      >
        Subscribe
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-[#17212d]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e2a38] p-8 rounded-3xl border border-gray-700 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-8 text-white text-center tracking-tight">Let's Connect</h2>
            <div className="space-y-4">
              <a href="https://github.com/kamalovicdev-sys" target="_blank" className="flex items-center justify-center w-full py-3 bg-[#17212d] border border-gray-600 rounded-xl hover:border-white transition-all hover:translate-x-1">GitHub</a>
              <a href="https://t.me/kama1ovic" target="_blank" className="flex items-center justify-center w-full py-3 bg-[#17212d] border border-gray-600 rounded-xl hover:border-white transition-all hover:translate-x-1">Telegram</a>
              <a href="https://kamalovic.netlify.app" target="_blank" className="flex items-center justify-center w-full py-3 bg-[#17212d] border border-gray-600 rounded-xl hover:border-white transition-all hover:translate-x-1">Website</a>
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