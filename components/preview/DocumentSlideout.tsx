"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import {
  X,
  Copy,
  Check,
  FileText,
  FileCode,
  Download,
  ExternalLink,
} from "lucide-react";

export function DocumentSlideout() {
  const { previewDocument, setPreviewDocument, showToast } = useChat();
  const [copied, setCopied] = useState(false);

  if (!previewDocument) return null;

  const isPdf = previewDocument.fileType === "pdf";
  const isCode = previewDocument.fileType === "code";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewDocument.extractedText);
      setCopied(true);
      showToast("Document context copied", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([previewDocument.extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted_${previewDocument.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded extracted text", "success");
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex">
      {/* Dimmed backdrop on mobile */}
      <div
        className="fixed inset-0 bg-black/20 md:hidden"
        onClick={() => setPreviewDocument(null)}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-[460px] h-full flex flex-col bg-[var(--bg-elevated)] border-l border-[var(--border)] shadow-[var(--shadow-window)] macos-vibrancy animate-in slide-in-from-right duration-250 select-none">
        {/* Panel Header */}
        <div className="h-[52px] min-h-[52px] px-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-titlebar)]">
          <div className="flex items-center gap-2.5 min-w-0">
            {isPdf ? (
              <span className="p-1 rounded bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
                <FileText className="w-4 h-4" />
              </span>
            ) : isCode ? (
              <span className="p-1 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                <FileCode className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <FileText className="w-4 h-4" />
              </span>
            )}

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[13px] text-[var(--text-primary)] truncate">
                {previewDocument.name}
              </span>
              <span className="text-[10.5px] text-[var(--text-tertiary)]">
                {isPdf
                  ? `${previewDocument.pageCount || 1} pages • ${(previewDocument.size / 1024).toFixed(1)} KB`
                  : `${previewDocument.lineCount || 1} lines • ${(previewDocument.size / 1024).toFixed(1)} KB`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setPreviewDocument(null)}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Close Panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Content Preview */}
        <div className="flex-1 overflow-y-auto p-4 select-text">
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-hover)]/50 p-3.5 font-mono text-[12px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words">
            {previewDocument.extractedText || "No text extracted."}
          </div>
        </div>

        {/* Floating Action Bar at the bottom */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-primary)]/80 macos-vibrancy">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            Extracted context for Ollama
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] text-[12px] font-medium border border-[var(--border)] transition-colors"
              title="Download text"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-medium shadow-sm transition-colors"
              title="Copy Extracted Context"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
