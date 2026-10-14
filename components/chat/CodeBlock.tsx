"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import Prism from "prismjs";

// Import common programming language grammars for Prism
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language = "text", code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanLang = useMemo(() => {
    const raw = language.replace(/^language-/, "").toLowerCase();
    if (raw === "js") return "javascript";
    if (raw === "ts") return "typescript";
    if (raw === "py") return "python";
    if (raw === "sh" || raw === "zsh") return "bash";
    if (raw === "yml") return "yaml";
    return raw;
  }, [language]);

  const highlightedHtml = useMemo(() => {
    const grammar = Prism.languages[cleanLang];
    if (grammar) {
      try {
        return Prism.highlight(code, grammar, cleanLang);
      } catch {
        return null;
      }
    }
    return null;
  }, [code, cleanLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-3 rounded-[8px] overflow-hidden border border-[var(--code-border)] bg-[var(--code-bg)] text-[var(--code-text)] shadow-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--code-header-bg)] border-b border-[var(--code-border)] text-[11px] font-mono text-[var(--text-tertiary)] select-none">
        <span className="uppercase font-medium tracking-wider text-[10.5px]">
          {cleanLang || "CODE"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors text-[11px]"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[var(--status-success)]" />
              <span className="text-[var(--status-success)] font-sans text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-sans text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3.5 overflow-x-auto text-[12.5px] leading-relaxed font-mono">
        <pre className="!bg-transparent !p-0 !m-0 !overflow-visible">
          {highlightedHtml ? (
            <code
              className={`language-${cleanLang} selectable-text`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <code className="selectable-text">{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
