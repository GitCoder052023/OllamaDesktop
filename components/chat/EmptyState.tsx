"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import {
  Terminal,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Upload,
} from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { activeConversation, ollamaStatus, refreshOllamaStatus, showToast } = useChat();
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const currentModel = activeConversation?.model || (ollamaStatus.models[0]?.name ?? "qwen2.5-coder:7b");
  const modelInfo = ollamaStatus.models.find((m) => m.name === currentModel);

  const starterActions = [
    {
      title: "Review code for edge cases and performance",
      prompt: "Review this code for performance bottlenecks, edge cases, and type safety:\n\n",
    },
    {
      title: "Explain operating system or systems concept",
      prompt: "Explain how memory paging and virtual addressing work at the hardware and kernel level.",
    },
    {
      title: "Debug an unexpected runtime error",
      prompt: "I'm encountering an unexpected error. Here is the stack trace and reproduction steps:\n\n",
    },
    {
      title: "Analyze architecture of attached document",
      prompt: "Summarize the key architectural decisions and requirements from this document:\n\n",
    },
  ];

  const handleCopyPull = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCommand(true);
      showToast("Command copied to clipboard", "success");
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await refreshOllamaStatus();
    setIsRetrying(false);
  };

  // -------------------------------------------------------------
  // STATE A: Ollama Service is Offline / Unreachable
  // -------------------------------------------------------------
  if (!ollamaStatus.connected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center select-none">
        <div className="w-9 h-9 rounded-[8px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-500">
          <AlertCircle className="w-4 h-4 stroke-[2]" />
        </div>

        <h2 className="text-[14.5px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          Ollama Service Offline
        </h2>

        <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          Cannot reach Ollama at <code className="font-mono text-[11px] bg-[var(--surface-hover)] px-1 py-0.5 rounded">{ollamaStatus.host}</code>. Ensure the Ollama daemon is running.
        </p>

        <div className="w-full p-2.5 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] text-left mb-3.5 font-mono text-[11px] text-[var(--text-secondary)]">
          <div className="text-[10px] uppercase font-sans font-semibold text-[var(--text-tertiary)] mb-1">
            Start in Terminal:
          </div>
          <div className="flex items-center justify-between text-[var(--text-primary)]">
            <code>ollama serve</code>
            <button
              onClick={() => handleCopyPull("ollama serve")}
              className="p-1 hover:text-[var(--accent)] transition-colors"
              title="Copy command"
            >
              {copiedCommand ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-medium shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE B: Connected but No Models Installed
  // -------------------------------------------------------------
  if (ollamaStatus.connected && ollamaStatus.models.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center select-none">
        <div className="w-9 h-9 rounded-[8px] bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center mb-3 text-[var(--accent)]">
          <Terminal className="w-4 h-4 stroke-[2]" />
        </div>

        <h2 className="text-[14.5px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          No Local Models
        </h2>

        <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          Ollama is active, but no models are downloaded yet. Pull a model in Terminal to begin.
        </p>

        <div className="w-full space-y-1.5 mb-4 text-left">
          {[
            { name: "qwen2.5-coder:7b", desc: "4.7 GB • Coding specialist" },
            { name: "llama3.2:3b", desc: "2.0 GB • Fast general assistant" },
          ].map((item) => (
            <div
              key={item.name}
              className="p-2 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-between"
            >
              <div>
                <code className="text-[11.5px] font-mono font-medium text-[var(--text-primary)]">
                  ollama pull {item.name}
                </code>
                <p className="text-[10px] text-[var(--text-tertiary)]">{item.desc}</p>
              </div>
              <button
                onClick={() => handleCopyPull(`ollama pull ${item.name}`)}
                className="p-1 rounded hover:bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Copy pull command"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] text-[12px] font-medium border border-[var(--border)] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          <span>Refresh Models</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE C: Ready Utility State (Restrained desktop composition)
  // -------------------------------------------------------------
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 max-w-lg mx-auto select-none">
      {/* App Symbol & Identifier */}
      <div className="w-9 h-9 rounded-[8px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-2.5 text-[var(--accent)] shadow-[var(--shadow-sm)]">
        <Terminal className="w-4 h-4 stroke-[2]" />
      </div>

      <h1 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
        Ollama Desktop
      </h1>

      <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] font-mono mb-6">
        <span>{currentModel}</span>
        {modelInfo?.details.parameterSize && (
          <>
            <span>•</span>
            <span>{modelInfo.details.parameterSize}</span>
          </>
        )}
        <span>•</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium text-[11px]">Ready</span>
      </div>

      {/* Compact Text-First Action Prompts */}
      <div className="w-full space-y-1 mb-6">
        <div className="px-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
          Quick Starters
        </div>
        {starterActions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] text-[12.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-between group"
            title="Load into composer"
          >
            <span className="truncate">{item.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>

      {/* Desktop Keyboard Shortcuts & Attachment Footnote */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-tertiary)] w-full">
        <div className="flex items-center gap-3">
          <span><kbd className="kbd">⌘N</kbd> New Chat</span>
          <span><kbd className="kbd">⌘K</kbd> Open</span>
          <span><kbd className="kbd">⌘,</kbd> Preferences</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px] opacity-75">
          <Upload className="w-3 h-3" />
          <span>Drop code, documents, or images to attach</span>
        </div>
      </div>
    </div>
  );
}
