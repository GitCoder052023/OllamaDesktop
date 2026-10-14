"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import {
  Sparkles,
  Code2,
  FileText,
  Zap,
  Terminal,
  Eye,
  Cpu,
  Layers,
  Upload,
} from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { activeConversation, ollamaStatus } = useChat();

  const currentModel = activeConversation?.model;
  const modelInfo = ollamaStatus.models.find((m) => m.name === currentModel);

  const starters = [
    {
      icon: Code2,
      category: "Code & Logic",
      title: "Build a TypeScript cache",
      prompt: "Write a high-performance in-memory LRU cache class in TypeScript with TTL expiry and unit tests.",
    },
    {
      icon: FileText,
      category: "Document Intelligence",
      title: "Analyze & summarize files",
      prompt: "Can you help me analyze, extract key takeaways, and review code or PDF documents? You can drag and drop any file directly onto this window.",
    },
    {
      icon: Zap,
      category: "Refactor & Review",
      title: "Optimize an algorithm",
      prompt: "Review this function for potential bottlenecks, race conditions, memory leaks, and propose an idiomatic optimization.",
    },
    {
      icon: Terminal,
      category: "System Architecture",
      title: "Design a Go microservice",
      prompt: "Architect a resilient background worker system in Go using worker pools, graceful shutdown, and context cancellation.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto select-none">
      {/* App Logo / Native Icon */}
      <div className="w-16 h-16 rounded-[14px] bg-gradient-to-b from-[var(--surface-hover)] to-[var(--surface-active)] border border-[var(--border)] shadow-[var(--shadow-md)] flex items-center justify-center mb-5">
        <Sparkles className="w-8 h-8 text-[var(--accent)] stroke-[1.8]" />
      </div>

      <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)] mb-1">
        Ollama Desktop
      </h1>

      <p className="text-[13px] text-[var(--text-secondary)] mb-6 text-center max-w-md">
        Native macOS interface for your local LLMs. Private, blazing-fast, and powered by your machine.
      </p>

      {/* Current Model Specs Pill Card */}
      {modelInfo ? (
        <div className="mb-8 px-4 py-2.5 rounded-[10px] bg-[var(--surface-hover)] border border-[var(--border)] flex flex-wrap items-center justify-center gap-3 text-[12px] text-[var(--text-secondary)] shadow-sm">
          <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
            {modelInfo.name}
          </span>
          {modelInfo.details.parameterSize && (
            <span className="flex items-center gap-1">
              <span className="text-[var(--text-tertiary)]">•</span>
              {modelInfo.details.parameterSize} params
            </span>
          )}
          {modelInfo.details.quantizationLevel && (
            <span className="flex items-center gap-1">
              <span className="text-[var(--text-tertiary)]">•</span>
              {modelInfo.details.quantizationLevel}
            </span>
          )}
          {modelInfo.details.contextLength && (
            <span className="flex items-center gap-1">
              <span className="text-[var(--text-tertiary)]">•</span>
              {(modelInfo.details.contextLength / 1024).toFixed(0)}k context
            </span>
          )}
          {modelInfo.isVision && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Eye className="w-3 h-3" /> Vision
            </span>
          )}
        </div>
      ) : (
        <div className="mb-8 px-3.5 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[12px] text-[var(--text-secondary)] font-mono">
          {currentModel || "qwen2.5-coder:7b"}
        </div>
      )}

      {/* Starter Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
        {starters.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="text-left p-3.5 rounded-[8px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] active:bg-[var(--surface-active)] transition-all group"
            >
              <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--accent)] mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span>{item.category}</span>
              </div>
              <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {item.title}
              </div>
              <div className="text-[11.5px] text-[var(--text-tertiary)] line-clamp-1 mt-0.5">
                {item.prompt}
              </div>
            </button>
          );
        })}
      </div>

      {/* Drag & Drop Hint */}
      <div className="flex items-center gap-2 text-[11.5px] text-[var(--text-tertiary)]">
        <Upload className="w-3.5 h-3.5" />
        <span>Drop any PDF, document, code, or image anywhere to attach</span>
      </div>
    </div>
  );
}
