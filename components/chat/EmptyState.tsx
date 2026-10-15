"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import {
  RefreshCw,
  Copy,
  Check,
  Code2,
  Bug,
  BookOpen,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import { OllamaLogo } from "@/components/ui/OllamaLogo";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { ollamaStatus, refreshOllamaStatus, showToast } = useChat();
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const starterActions = [
    {
      icon: Code2,
      label: "Review a code snippet for performance and edge cases",
      prompt: "Review this code for performance bottlenecks, edge cases, and type safety:\n\n```\n\n```",
    },
    {
      icon: BookOpen,
      label: "Explain a complex systems or engineering concept",
      prompt: "Explain how memory paging and virtual addressing work at the hardware and kernel level.",
    },
    {
      icon: Bug,
      label: "Help debug an unexpected runtime error",
      prompt: "I'm encountering an unexpected error. Here is the reproduction code and error trace:\n\n",
    },
    {
      icon: FileSearch,
      label: "Analyze key architectural decisions in a document",
      prompt: "Summarize the key architectural decisions, invariants, and trade-offs from this document:\n\n",
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
      <div className="h-full flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center select-none">
        <div className="w-11 h-11 rounded-[12px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-500 shadow-xs">
          <OllamaLogo className="w-6 h-6" />
        </div>

        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          Ollama Service Offline
        </h2>

        <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          OllamaDesktop cannot reach Ollama at <code className="font-mono text-[11px] bg-[var(--surface-hover)] px-1 py-0.5 rounded">{ollamaStatus.host}</code>. Ensure the service is running.
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
              {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-medium shadow-sm transition-colors"
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
      <div className="h-full flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center select-none">
        <div className="w-11 h-11 rounded-[12px] bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center mb-3 text-[var(--accent)] shadow-xs">
          <OllamaLogo className="w-6 h-6" />
        </div>

        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          No Local Models Installed
        </h2>

        <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          OllamaDesktop is connected, but no models are downloaded yet. Pull a model in Terminal to begin.
        </p>

        <div className="w-full space-y-1.5 mb-4 text-left">
          {[
            { name: "qwen2.5-coder:7b", desc: "4.7 GB • Fast coding specialist" },
            { name: "llama3.2:3b", desc: "2.0 GB • Lightweight general assistant" },
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
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] text-[12px] font-medium border border-[var(--border)] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          <span>Refresh Models</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE C: Refined, Focused Home Screen (Conversation-Centric)
  // -------------------------------------------------------------
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 max-w-[820px] mx-auto w-full select-none">
      {/* Proper OllamaDesktop Brand Hero */}
      <div className="w-12 h-12 rounded-[13px] bg-gradient-to-br from-[var(--surface-active)] to-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-3 shadow-xs">
        <OllamaLogo className="w-6 h-6" />
      </div>

      {/* Clear, Inviting Welcome */}
      <h1 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight mb-1 text-center">
        Ollama<span className="text-[var(--accent)]">Desktop</span>
      </h1>

      <p className="text-[12.5px] text-[var(--text-secondary)] mb-6 text-center max-w-sm leading-relaxed">
        Native local AI client for macOS. Private, offline, and blazing fast.
      </p>

      {/* Lightweight, Understated Starter Prompts */}
      <div className="w-full max-w-[500px] space-y-1.5">
        {starterActions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="w-full text-left px-3.5 py-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all flex items-center justify-between group cursor-pointer shadow-[var(--shadow-sm)]"
            title="Populate composer with prompt"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <item.icon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" />
              <span className="text-[12.5px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                {item.label}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
