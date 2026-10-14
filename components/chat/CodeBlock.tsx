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
    <div className="my-3 rounded-[8px] overflow-hidden border border-[var(--border)] bg-[#1e1e20] text-[#e4e4e7] shadow-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#18181b] border-b border-[#27272a] text-[11px] font-mono text-[#a1a1aa] select-none">
        <span className="uppercase font-semibold tracking-wider">{cleanLang || "CODE"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] hover:bg-[#27272a] hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
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
