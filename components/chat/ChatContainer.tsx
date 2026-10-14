"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import {
  ChevronDown,
  Trash2,
  Share2,
  Sparkles,
  Cpu,
  ArrowDown,
  Eye,
  Check,
} from "lucide-react";

export function ChatContainer() {
  const {
    activeConversation,
    sendMessage,
    changeConversationModel,
    clearCurrentConversation,
    ollamaStatus,
    showToast,
    isStreaming,
  } = useChat();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isStreaming ? "auto" : "smooth");
  }, [activeConversation?.messages, isStreaming]);

  // Monitor scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportChat = () => {
    if (!activeConversation || activeConversation.messages.length === 0) {
      showToast("No messages to export", "info");
      return;
    }

    const markdown = activeConversation.messages
      .map((m) => `### ${m.role === "user" ? "You" : "Ollama"}\n\n${m.content}\n\n---\n`)
      .join("\n");

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Chat exported as Markdown", "success");
  };

  const currentModel = activeConversation?.model || "qwen2.5-coder:7b";
  const messages = activeConversation?.messages || [];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)] relative select-none">
      {/* Chat Sub-Header / Model Selector Toolbar */}
      <div className="h-[44px] min-h-[44px] border-b border-[var(--border)] px-4 flex items-center justify-between bg-[var(--bg-primary)]/80 macos-vibrancy z-10">
        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all text-[12.5px] font-medium text-[var(--text-primary)]"
          >
            <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-mono">{currentModel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          </button>

          {/* Dropdown Menu */}
          {isModelDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                Installed Models
              </div>

              {ollamaStatus.models.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[var(--text-tertiary)]">
                  No local models detected. Pull one with:
                  <div className="mt-1 font-mono text-[11px] bg-[var(--surface-hover)] p-1 rounded">
                    ollama pull qwen2.5-coder:7b
                  </div>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto py-0.5">
                  {ollamaStatus.models.map((m) => {
                    const isSelected = m.name === currentModel;
                    return (
                      <button
                        key={m.name}
                        onClick={() => {
                          if (activeConversation) {
                            changeConversationModel(activeConversation.id, m.name);
                          }
                          setIsModelDropdownOpen(false);
                          showToast(`Switched model to ${m.name}`, "info");
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[12.5px] hover:bg-[var(--surface-hover)] transition-colors ${
                          isSelected
                            ? "text-[var(--accent)] font-medium bg-[var(--surface-active)]/50"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-mono">{m.name}</span>
                          <span className="text-[10.5px] text-[var(--text-tertiary)]">
                            {m.details.parameterSize || `${(m.size / 1e9).toFixed(1)} GB`}
                            {m.isVision ? " • Vision" : ""}
                          </span>
                        </div>

                        {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Chat Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportChat}
            disabled={messages.length === 0}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30"
            title="Export conversation as Markdown"
          >
            <Share2 className="w-4 h-4 stroke-[1.8]" />
          </button>
          <button
            onClick={clearCurrentConversation}
            disabled={messages.length === 0}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30"
            title="Clear current conversation"
          >
            <Trash2 className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
      >
        {messages.length === 0 ? (
          <EmptyState
            onSelectPrompt={(prompt) => {
              setSelectedPrompt(prompt);
              // Trigger send or populate
              sendMessage(prompt);
            }}
          />
        ) : (
          <div className="pb-4">
            {messages.map((message, idx) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                isLast={idx === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to Bottom Floating Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-4 right-6 p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all z-20"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Chat Input */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-primary)]/80 macos-vibrancy">
        <ChatInput
          onSendMessage={(content, attachments) => sendMessage(content, attachments)}
          externalText={selectedPrompt}
        />
      </div>
    </main>
  );
}
