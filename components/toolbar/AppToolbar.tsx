"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  Settings,
  HelpCircle,
  Terminal,
  Maximize2,
  Minimize2,
  Cpu,
  ChevronDown,
} from "lucide-react";

interface AppToolbarProps {
  isWindowed?: boolean;
  onToggleWindowed?: () => void;
  onOpenModelSelector?: () => void;
}

export function AppToolbar({
  isWindowed = false,
  onToggleWindowed,
  onOpenModelSelector,
}: AppToolbarProps) {
  const {
    activeConversation,
    isSidebarOpen,
    setIsSidebarOpen,
    createConversation,
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

  const currentModel = activeConversation?.model || (ollamaStatus.models[0]?.name ?? "No model");

  return (
    <header className="h-[48px] min-h-[48px] select-none border-b border-[var(--border)] bg-[var(--bg-toolbar)] macos-vibrancy flex items-center justify-between px-3 z-30 relative">
      {/* Left Toolbar Controls */}
      <div className="flex items-center gap-1.5">
        {/* App Symbol & Identifier */}
        <div className="flex items-center gap-2 pl-1 pr-1.5 py-1 text-[var(--text-primary)]">
          <div className="w-6 h-6 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0">
            <Terminal className="w-3.5 h-3.5 stroke-[2]" />
          </div>
        </div>

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

      {/* Center: Context & Active Conversation */}
      <div className="flex-1 flex items-center justify-center px-4 max-w-[480px]">
        <div className="flex items-center gap-2 cursor-default truncate">
          <span className="font-semibold text-[13px] text-[var(--text-primary)] tracking-tight truncate">
            {activeConversation?.title || "Ollama Desktop"}
          </span>

          {/* Quick Model Selector Trigger in Center */}
          <button
            onClick={onOpenModelSelector}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors font-mono text-[11px] shrink-0"
            title="Switch model"
          >
            <Cpu className="w-3 h-3 text-[var(--accent)]" />
            <span className="truncate max-w-[120px]">{currentModel.split(":")[0]}</span>
            <ChevronDown className="w-2.5 h-2.5 text-[var(--text-tertiary)]" />
          </button>
        </div>
      </div>

      {/* Right Global Actions */}
      <div className="flex items-center gap-1.5">
        {/* Ollama Connection Indicator Pill */}
        <button
          onClick={handleStatusClick}
          className={`h-7 flex items-center gap-1.5 px-2.5 rounded-[6px] text-[11.5px] border transition-colors ${
            ollamaStatus.connected
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
              : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15"
          }`}
          title={
            ollamaStatus.connected
              ? `Ollama v${ollamaStatus.version || "active"} • ${ollamaStatus.models.length} model${
                  ollamaStatus.models.length === 1 ? "" : "s"
                } available at ${ollamaStatus.host}. Click to re-check.`
              : `Cannot reach Ollama at ${ollamaStatus.host}. Ensure 'ollama serve' is running. Click to retry.`
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
          className="h-7 flex items-center gap-1.5 px-2.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors text-[12px]"
          title="Search Conversations & Actions (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px] text-[var(--text-tertiary)]">Search</span>
          <kbd className="kbd">⌘K</kbd>
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
