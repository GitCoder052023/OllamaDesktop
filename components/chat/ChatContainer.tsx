"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { ModelSelector } from "@/components/model-selector/ModelSelector";
import {
  Trash2,
  Share2,
  ArrowDown,
} from "lucide-react";

export function ChatContainer() {
  const {
    activeConversation,
    sendMessage,
    clearCurrentConversation,
    showToast,
    isStreaming,
  } = useChat();

  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleExportChat = () => {
    if (!activeConversation || activeConversation.messages.length === 0) {
      showToast("No messages to export", "info");
      return;
    }

    const markdown = activeConversation.messages
      .map((m) => `### ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}\n\n---\n`)
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

  const messages = activeConversation?.messages || [];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)] relative select-none">
      {/* Chat Sub-Header: Model Selector & Actions */}
      <div className="h-[42px] min-h-[42px] border-b border-[var(--border)] px-3.5 flex items-center justify-between bg-[var(--bg-primary)]/80 macos-vibrancy z-10">
        {/* Model Selector Popover */}
        <ModelSelector />

        {/* Right Chat Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportChat}
            disabled={messages.length === 0}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors disabled:opacity-30"
            title="Export conversation as Markdown"
            aria-label="Export Markdown"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
          <button
            onClick={clearCurrentConversation}
            disabled={messages.length === 0}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors disabled:opacity-30"
            title="Clear current conversation"
            aria-label="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
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
              // Populate the composer so user can inspect, append or edit before sending
              setSelectedPrompt(prompt);
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

        {/* Scroll to Bottom Floating Pill */}
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

      {/* Message Composer Area */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-primary)]/80 macos-vibrancy">
        <ChatInput
          onSendMessage={(content, attachments) => sendMessage(content, attachments)}
          externalText={selectedPrompt}
        />
      </div>
    </main>
  );
}
