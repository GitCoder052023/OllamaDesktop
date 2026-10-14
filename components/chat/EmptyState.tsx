"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import {
  Terminal,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Upload,
  Cpu,
  Code2,
  Bug,
  BookOpen,
  FileSearch,
} from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { activeConversation, ollamaStatus, refreshOllamaStatus, showToast, settings } = useChat();
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const currentModel = activeConversation?.model || (ollamaStatus.models[0]?.name ?? "qwen2.5-coder:7b");
  const modelInfo = ollamaStatus.models.find((m) => m.name === currentModel);

  const currentTemp = activeConversation?.temperature ?? settings.temperature ?? 0.7;
  const currentCtx = activeConversation?.contextLength ?? modelInfo?.details.contextLength ?? 32768;

  const starterActions = [
    {
      icon: Code2,
      title: "Review code snippet",
      desc: "Analyze for edge cases, performance bottlenecks, and typing",
      prompt: "Review this code for performance bottlenecks, edge cases, and type safety:\n\n```\n\n```",
    },
    {
      icon: BookOpen,
      title: "Explain systems concept",
      desc: "Break down virtual memory, hardware paging, or concurrency",
      prompt: "Explain how memory paging and virtual addressing work at the hardware and OS kernel level.",
    },
    {
      icon: Bug,
      title: "Debug runtime error",
      desc: "Diagnose an unexpected exception, stack trace, or memory leak",
      prompt: "I'm encountering an unexpected error. Here is the stack trace and reproduction steps:\n\n",
    },
    {
      icon: FileSearch,
      title: "Analyze attached document",
      desc: "Extract architecture decisions and action items from file context",
      prompt: "Summarize the key architectural decisions, invariants, and action items from this document:\n\n",
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
        <div className="w-10 h-10 rounded-[8px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-500">
          <AlertCircle className="w-5 h-5 stroke-[2]" />
        </div>

        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center select-none">
        <div className="w-10 h-10 rounded-[8px] bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center mb-3 text-[var(--accent)]">
          <Terminal className="w-5 h-5 stroke-[2]" />
        </div>

        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
          No Local Models
        </h2>

        <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          Ollama is connected, but no models are downloaded yet. Pull a recommended model to begin.
        </p>

        <div className="w-full space-y-1.5 mb-4 text-left">
          {[
            { name: "qwen2.5-coder:7b", desc: "4.7 GB • Coding & systems specialist" },
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
  // STATE C: Production-Grade Model Launchpad & Workspace
  // -------------------------------------------------------------
  return (
    <div className="max-w-[820px] mx-auto w-full py-6 px-4 select-none flex flex-col items-center">
      {/* App & Model Header */}
      <div className="flex items-center gap-2 mb-1 text-[var(--text-primary)]">
        <div className="w-7 h-7 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
          <Terminal className="w-4 h-4 stroke-[2]" />
        </div>
        <h1 className="text-[16px] font-semibold tracking-tight">Ollama Desktop</h1>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] mb-5 text-center">
        Local offline intelligence powered by Ollama engine
      </p>

      {/* Model Technical Specification Card */}
      <div className="w-full max-w-[640px] rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] p-3.5 mb-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-mono font-semibold text-[13px] text-[var(--text-primary)]">
              {currentModel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Inference Ready</span>
          </div>
        </div>

        {/* 4-Metric Hardware / Model Spec Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">Architecture</div>
            <div className="font-mono font-medium text-[var(--text-primary)] truncate mt-0.5">
              {modelInfo?.details.family || "GGUF"}
            </div>
          </div>

          <div className="p-2 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">Parameters</div>
            <div className="font-mono font-medium text-[var(--text-primary)] truncate mt-0.5">
              {modelInfo?.details.parameterSize || "Unknown"}
            </div>
          </div>

          <div className="p-2 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">Quantization</div>
            <div className="font-mono font-medium text-[var(--text-primary)] truncate mt-0.5">
              {modelInfo?.details.quantizationLevel || "Q4_K_M"}
            </div>
          </div>

          <div className="p-2 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">Context Window</div>
            <div className="font-mono font-medium text-[var(--text-primary)] truncate mt-0.5">
              {currentCtx ? `${(currentCtx / 1024).toFixed(0)}K tokens` : "32K tokens"}
            </div>
          </div>
        </div>

        {/* Session Generation Parameter Glance */}
        <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>Temperature: <strong className="font-mono text-[var(--text-primary)]">{currentTemp.toFixed(2)}</strong></span>
            <span>•</span>
            <span>Context: <strong className="font-mono text-[var(--text-primary)]">{(currentCtx / 1024).toFixed(0)}K</strong></span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10.5px] text-[var(--text-tertiary)]">
            <span>Host: localhost:11434</span>
          </div>
        </div>
      </div>

      {/* Developer Action Starters (Technical 2x2 Grid) */}
      <div className="w-full max-w-[640px] mb-5">
        <div className="px-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Suggested Tasks
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {starterActions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-all text-left group shadow-[var(--shadow-sm)]"
              title="Populate composer with prompt"
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="font-medium text-[12.5px] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1 leading-normal">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Shortcuts & File Attachment Hint */}
      <div className="w-full max-w-[640px] pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-tertiary)]">
        <div className="flex items-center gap-3">
          <span><kbd className="kbd">⌘N</kbd> New Chat</span>
          <span><kbd className="kbd">⌘K</kbd> Search</span>
          <span><kbd className="kbd">⌘,</kbd> Preferences</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10.5px]">
          <Upload className="w-3 h-3 opacity-60" />
          <span>Drop PDFs, code, text, or images to attach context</span>
        </div>
      </div>
    </div>
  );
}
