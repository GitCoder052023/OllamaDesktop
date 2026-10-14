"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { X, Download } from "lucide-react";

export function ImageLightbox() {
  const { previewImage, setPreviewImage } = useChat();

  if (!previewImage) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = previewImage;
    a.download = `ollama_image_${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={() => setPreviewImage(null)}
    >
      <div
        className="relative max-w-4xl max-h-[85vh] rounded-[10px] overflow-hidden border border-white/10 shadow-[var(--shadow-window)] flex flex-col bg-[#1c1c1e]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top controls */}
        <div className="h-10 px-3 flex items-center justify-between bg-black/40 border-b border-white/10 text-white text-[12px]">
          <span>Image Preview</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewImage(null)}
              className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="flex items-center justify-center p-2 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[75vh] w-auto max-w-full object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
}
