"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { ModelSelector } from "@/components/model-selector/ModelSelector";
import { SessionParametersPopover } from "@/components/toolbar/SessionParametersPopover";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  Settings,
  HelpCircle,
  Maximize2,
  Minimize2,
  Share2,
  Trash2,
} from "lucide-react";

interface AppToolbarProps {
  isWindowed?: boolean;
  onToggleWindowed?: () => void;
}

export function AppToolbar({
  isWindowed = false,
  onToggleWindowed,
}: AppToolbarProps) {
  const {
    activeConversation,
    isSidebarOpen,
    setIsSidebarOpen,
    createConversation,
    clearCurrentConversation,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    setIsShortcutsOpen,
    ollamaStatus,
    refreshOllamaStatus,
    showToast,
  } = useChat();

  const handleStatusClick = async () => {
    showToast("Checking Ollama connection...", "info");
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

  return (
    <header className="h-[48px] min-h-[48px] select-none border-b border-[var(--border)] bg-[var(--bg-toolbar)] macos-vibrancy flex items-center justify-between px-3 z-30 relative">
      {/* Left Toolbar Controls */}
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

      {/* Center: The Single Cohesive Model Station */}
      <div className="flex-1 flex items-center justify-center gap-1.5 px-2 min-w-0">
        <ModelSelector align="center" />
        <SessionParametersPopover align="center" buttonVariant="toolbar" />
      </div>

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Contextual Conversation Actions (When active conversation has messages) */}
        {activeConversation && activeConversation.messages.length > 0 && (
          <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-[var(--border)]">
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

        {/* Ollama Connection Indicator Pill */}
        <button
          onClick={handleStatusClick}
          className={`h-7 flex items-center gap-1.5 px-2 rounded-[6px] text-[11.5px] border transition-colors ${
            ollamaStatus.connected
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
              : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15"
          }`}
          title={
            ollamaStatus.connected
              ? `Ollama connected (${ollamaStatus.models.length} model${
                  ollamaStatus.models.length === 1 ? "" : "s"
                }) at ${ollamaStatus.host}. Click to re-check.`
              : `Cannot reach Ollama at ${ollamaStatus.host}. Click to retry.`
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ollamaStatus.connected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
            }`}
          />
          <span className="hidden md:inline font-medium">
            {ollamaStatus.connected
              ? `${ollamaStatus.models.length} Model${ollamaStatus.models.length === 1 ? "" : "s"}`
              : "Offline"}
          </span>
        </button>

        {/* Command Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="h-7 flex items-center gap-1.5 px-2 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors text-[11.5px]"
          title="Search Conversations & Commands (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <kbd className="kbd text-[10px]">⌘K</kbd>
        </button>

        {/* Shortcuts Trigger */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
          title="Keyboard Shortcuts (⌘/)"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Settings Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
          title="Preferences (⌘,)"
          aria-label="Preferences"
        >
          <Settings className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Window Viewport Presentation Toggle (Optional frame) */}
        {onToggleWindowed && (
          <button
            onClick={onToggleWindowed}
            className="h-7 w-7 rounded-[6px] hidden sm:flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
            title={isWindowed ? "Expand Full Viewport" : "Show Desktop Window Frame"}
            aria-label="Toggle Window Frame Style"
          >
            {isWindowed ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
