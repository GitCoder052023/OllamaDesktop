"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  Settings,
  HelpCircle,
  Share2,
  Trash2,
  Square,
} from "lucide-react";

export function AppToolbar() {
  const router = useRouter();
  const {
    activeConversation,
    isSidebarOpen,
    setIsSidebarOpen,
    createConversation,
    clearCurrentConversation,
    setIsCommandPaletteOpen,
    setIsShortcutsOpen,
    ollamaStatus,
    refreshOllamaStatus,
    showToast,
    isStreaming,
    stopGeneration,
  } = useChat();

  const handleStatusClick = async () => {
    showToast("Checking Ollama daemon status...", "info");
    await refreshOllamaStatus();
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

  const hasMessages = Boolean(activeConversation && activeConversation.messages.length > 0);

  return (
    <header className="h-[44px] min-h-[44px] select-none border-b border-[var(--border)] bg-[var(--bg-toolbar)] macos-vibrancy flex items-center justify-between px-3 z-30 relative">
      {/* 1. Left Region: Navigation Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className={`h-7 w-7 rounded-[6px] flex items-center justify-center transition-colors ${
            isSidebarOpen
              ? "text-[var(--text-primary)] bg-[var(--surface-active)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]"
          }`}
          title={isSidebarOpen ? "Hide Sidebar (⌘B)" : "Show Sidebar (⌘B)"}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 stroke-[1.8]" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 stroke-[1.8]" />
          )}
        </button>

        {/* New Chat Button */}
        <button
          onClick={() => createConversation()}
          className="h-7 px-2.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors flex items-center gap-1.5 text-[12px] font-medium"
          title="New Conversation (⌘N)"
          aria-label="New Conversation"
        >
          <SquarePen className="w-3.5 h-3.5 stroke-[1.8]" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* 2. Center Region: Clean Window Title */}
      <div className="flex-1 flex items-center justify-center px-4 min-w-0 pointer-events-none select-none">
        {hasMessages && activeConversation ? (
          <span
            className="text-[13px] font-medium text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-[320px] md:max-w-[420px]"
            title={activeConversation.title}
          >
            {activeConversation.title}
          </span>
        ) : null}
      </div>

      {/* 3. Right Region: Clean Toolbar Actions & Status */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Streaming Stop Control */}
        {isStreaming && (
          <button
            onClick={stopGeneration}
            className="h-7 px-2.5 rounded-[6px] flex items-center gap-1.5 text-[11.5px] font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 active:bg-red-500/15 transition-colors shrink-0 mr-1"
            title="Stop Generation (Esc)"
            aria-label="Stop Generation"
          >
            <Square className="w-3 h-3 fill-current animate-pulse" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        )}

        {/* Contextual Conversation Actions (When active conversation has messages) */}
        {hasMessages && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleExportChat}
              className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
              title="Export conversation as Markdown"
              aria-label="Export Markdown"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[1.8]" />
            </button>
            <button
              onClick={clearCurrentConversation}
              className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
              title="Clear current messages"
              aria-label="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
            </button>
          </div>
        )}

        {/* Hairline Divider before system status & utilities */}
        {(hasMessages || isStreaming) && (
          <div className="w-[1px] h-3.5 bg-[var(--border)] shrink-0 mx-0.5" />
        )}

        {/* Ollama Connection Status Button */}
        <button
          onClick={handleStatusClick}
          className="h-7 px-2 rounded-[6px] flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
          title={
            ollamaStatus.connected
              ? `Ollama connected (${ollamaStatus.models.length} model${
                  ollamaStatus.models.length === 1 ? "" : "s"
                }) at ${ollamaStatus.host}. Click to re-check.`
              : `Cannot reach Ollama at ${ollamaStatus.host}. Click to retry.`
          }
          aria-label="Ollama connection status"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              ollamaStatus.connected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
            }`}
          />
          <span className="hidden md:inline text-[11px] text-[var(--text-tertiary)] font-normal">
            {ollamaStatus.connected ? "Connected" : "Offline"}
          </span>
        </button>

        {/* Command Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="h-7 px-2 rounded-[6px] flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors text-[11.5px]"
          title="Search Conversations & Commands (⌘K)"
          aria-label="Search and Commands"
        >
          <Search className="w-3.5 h-3.5 stroke-[1.8]" />
          <kbd className="hidden lg:inline font-mono text-[9px] px-1 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
            ⌘K
          </kbd>
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
          title="Keyboard Shortcuts (⌘/)"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5 stroke-[1.8]" />
        </button>

        {/* Preferences / Settings Trigger */}
        <button
          onClick={() => router.push("/settings")}
          className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
          title="Preferences (⌘,)"
          aria-label="Preferences"
        >
          <Settings className="w-3.5 h-3.5 stroke-[1.8]" />
        </button>
      </div>
    </header>
  );
}
