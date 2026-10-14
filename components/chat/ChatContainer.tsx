"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { ArrowDown } from "lucide-react";

export function ChatContainer() {
  const {
    activeConversation,
    sendMessage,
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

  const messages = activeConversation?.messages || [];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)] relative select-none">
      {/* Messages Scroll Area - Responsive 760-860px reading column */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto relative ${messages.length === 0 ? "flex flex-col items-center justify-center" : ""}`}
      >
        {messages.length === 0 ? (
          <EmptyState
            onSelectPrompt={(prompt) => {
              setSelectedPrompt(prompt);
            }}
          />
        ) : (
          <div className="py-4 md:py-6 max-w-[820px] mx-auto w-full px-4 sm:px-6">
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
      <div className="border-t border-[var(--border)] bg-[var(--bg-composer-container)] macos-vibrancy shrink-0">
        <ChatInput
          onSendMessage={(content, attachments) => sendMessage(content, attachments)}
          externalText={selectedPrompt}
        />
      </div>
    </main>
  );
}
