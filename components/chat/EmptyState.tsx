"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import {
  Terminal,
  Upload,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Code,
  FileSearch,
  Bug,
  HelpCircle,
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

  const starterPrompts = [
    {
      icon: Code,
      title: "Review code snippet",
      prompt: "Review this function for performance bottlenecks, edge cases, and type safety:",
    },
    {
      icon: HelpCircle,
      title: "Explain technical concept",
      prompt: "Explain how memory paging and virtual addressing work at the hardware and OS level.",
    },
    {
      icon: Bug,
      title: "Help debug an error",
      prompt: "I'm encountering an unexpected runtime error. Here is the stack trace and reproduction steps:",
    },
    {
      icon: FileSearch,
      title: "Analyze attached document",
      prompt: "Summarize the key architecture decisions and action items from this document:",
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

  // State A: Ollama Service is Offline / Unreachable
  if (!ollamaStatus.connected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center select-none">
        <div className="w-11 h-11 rounded-[10px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3.5 text-red-500">
          <AlertCircle className="w-5 h-5 stroke-[1.8]" />
        </div>

        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          Ollama is Offline
        </h2>

        <p className="text-[12.5px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          Cannot connect to Ollama at <code className="font-mono text-[11.5px] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded">{ollamaStatus.host}</code>. Ensure the Ollama daemon is running on your Mac.
        </p>

        <div className="w-full p-3 rounded-[8px] bg-[var(--surface-hover)] border border-[var(--border)] text-left mb-4 font-mono text-[11.5px] text-[var(--text-secondary)]">
          <div className="text-[10.5px] uppercase font-sans font-semibold text-[var(--text-tertiary)] mb-1">
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
          <span>Test Connection</span>
        </button>
      </div>
    );
  }

  // State B: Connected but No Models Installed
  if (ollamaStatus.connected && ollamaStatus.models.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center select-none">
        <div className="w-11 h-11 rounded-[10px] bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center mb-3.5 text-[var(--accent)]">
          <Terminal className="w-5 h-5 stroke-[1.8]" />
        </div>

        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          No Models Installed
        </h2>

        <p className="text-[12.5px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          Ollama is connected, but you haven&apos;t downloaded any local models yet. Pull a recommended model to begin chatting offline.
        </p>

        <div className="w-full space-y-2 mb-4">
          {[
            { name: "qwen2.5-coder:7b", desc: "Fast & intelligent coding assistant (4.7 GB)" },
            { name: "llama3.2:3b", desc: "Lightweight general purpose model (2.0 GB)" },
          ].map((item) => (
            <div
              key={item.name}
              className="p-2.5 rounded-[8px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-between text-left"
            >
              <div>
                <code className="text-[12px] font-mono font-medium text-[var(--text-primary)]">
                  ollama pull {item.name}
                </code>
                <p className="text-[10.5px] text-[var(--text-tertiary)] mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => handleCopyPull(`ollama pull ${item.name}`)}
                className="p-1.5 rounded hover:bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
          <span>Refresh Model List</span>
        </button>
      </div>
    );
  }

  // State C: Normal Ready State with Installed Model
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto select-none text-center">
      {/* Restrained Application Emblem */}
      <div className="w-11 h-11 rounded-[10px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-3.5 text-[var(--accent)] shadow-sm">
        <Terminal className="w-5 h-5 stroke-[1.8]" />
      </div>

      <h1 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
        Ollama Desktop
      </h1>

      <p className="text-[12.5px] text-[var(--text-secondary)] mb-3 max-w-sm leading-relaxed">
        Private local language models running on your Mac.
      </p>

      {/* Model Specs Metadata Pill */}
      {modelInfo ? (
        <div className="mb-6 inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] text-[11.5px] text-[var(--text-tertiary)] font-mono">
          <span className="font-medium text-[var(--text-primary)]">{modelInfo.name}</span>
          {modelInfo.details.parameterSize && (
            <>
              <span>•</span>
              <span>{modelInfo.details.parameterSize}</span>
            </>
          )}
          {modelInfo.details.quantizationLevel && (
            <>
              <span>•</span>
              <span>{modelInfo.details.quantizationLevel}</span>
            </>
          )}
          {modelInfo.isVision && (
            <>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">Vision</span>
            </>
          )}
        </div>
      ) : (
        <div className="mb-6 inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] text-[var(--text-tertiary)]">
          {currentModel}
        </div>
      )}

      {/* Practical Technical Starter Prompts (Clicking populates composer) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-left">
        {starterPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="p-3 rounded-[8px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-all text-left group shadow-[var(--shadow-sm)]"
            title="Populate composer with prompt"
          >
            <div className="flex items-center gap-2 mb-1 text-[var(--text-primary)]">
              <item.icon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="font-medium text-[12px]">{item.title}</span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Subtle Drag-and-Drop Hint */}
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
        <Upload className="w-3.5 h-3.5 opacity-60" />
        <span>Drop PDFs, code, text, or images anywhere to attach context</span>
      </div>
    </div>
  );
}
