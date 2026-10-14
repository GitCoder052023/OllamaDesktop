"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language = "text", code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const cleanLang = language.replace(/^language-/, "").toLowerCase();

  return (
    <div className="my-3 rounded-[8px] overflow-hidden border border-[var(--border)] bg-[var(--surface-hover)]/30 text-[var(--text-primary)]">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--surface-hover)] border-b border-[var(--border)] text-[11px] font-mono text-[var(--text-tertiary)] select-none">
        <span className="uppercase font-medium tracking-wider">{cleanLang || "CODE"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#34C759]" />
              <span className="text-[#34C759] font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[12.5px] leading-relaxed font-mono">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
