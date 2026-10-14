"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { Terminal, Upload } from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { activeConversation, ollamaStatus } = useChat();

  const currentModel = activeConversation?.model || "qwen2.5-coder:7b";
  const modelInfo = ollamaStatus.models.find((m) => m.name === currentModel);

  const promptSuggestions = [
    "Review this function for potential bottlenecks and edge cases",
    "Explain the architecture and design patterns for this task",
    "Extract key takeaways and action items from this document",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto select-none text-center">
      {/* Quiet Apple-style icon */}
      <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--accent)]">
        <Terminal className="w-6 h-6 stroke-[1.8]" />
      </div>

      <h1 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">
        Ollama Desktop
      </h1>

      <p className="text-[13px] text-[var(--text-secondary)] mb-4 max-w-sm leading-relaxed">
        Offline local models running directly on your Mac.
      </p>

      {/* Model Spec Line */}
      {modelInfo ? (
        <div className="mb-6 flex items-center justify-center gap-2 text-[11.5px] text-[var(--text-tertiary)] font-mono">
          <span className="font-medium text-[var(--text-secondary)]">{modelInfo.name}</span>
          {modelInfo.details.parameterSize && (
            <>
              <span>•</span>
              <span>{modelInfo.details.parameterSize}</span>
            </>
          )}
          {modelInfo.details.contextLength && (
            <>
              <span>•</span>
              <span>{(modelInfo.details.contextLength / 1024).toFixed(0)}k ctx</span>
            </>
          )}
          {modelInfo.isVision && (
            <>
              <span>•</span>
              <span className="text-[var(--accent)] font-sans font-medium">Vision</span>
            </>
          )}
        </div>
      ) : (
        <div className="mb-6 text-[11.5px] font-mono text-[var(--text-tertiary)]">
          {currentModel}
        </div>
      )}

      {/* Subtle Text Starters (No AI-slop cards) */}
      <div className="w-full space-y-1.5 mb-6">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="w-full text-left px-3.5 py-2 rounded-[6px] text-[12.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors border border-transparent hover:border-[var(--border)] flex items-center justify-between group"
          >
            <span className="truncate">{prompt}</span>
            <span className="text-[11px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
              ↵
            </span>
          </button>
        ))}
      </div>

      {/* Drag & Drop Hint */}
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
        <Upload className="w-3.5 h-3.5 opacity-70" />
        <span>Drop PDFs, code, text, or images anywhere to attach</span>
      </div>
    </div>
  );
}
