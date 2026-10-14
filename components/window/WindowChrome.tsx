"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  Settings,
  Sparkles,
  Maximize2,
  Minimize2,
  HelpCircle,
} from "lucide-react";

interface WindowChromeProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isWindowed?: boolean;
  setIsWindowed?: (v: boolean) => void;
}

export function WindowChrome({
  isWindowed = false,
  setIsWindowed,
}: WindowChromeProps) {
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

  const [isHoveringTrafficLights, setIsHoveringTrafficLights] = useState(false);
  const [isWindowActive, setIsWindowActive] = useState(true);

  // Monitor window focus
  React.useEffect(() => {
    const handleFocus = () => setIsWindowActive(true);
    const handleBlur = () => setIsWindowActive(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const handleClose = () => {
    showToast("Application cannot be closed in browser tab", "info");
  };

  const handleMinimize = () => {
    showToast("Application minimized", "info");
  };

  const handleMaximize = () => {
    if (setIsWindowed) {
      setIsWindowed(!isWindowed);
    }
  };

  return (
    <header className="h-[52px] min-h-[52px] select-none border-b border-[var(--border)] bg-[var(--bg-titlebar)] macos-vibrancy flex items-center justify-between px-3.5 z-30 relative">
      {/* Left: Traffic Lights & Navigation */}
      <div className="flex items-center gap-3">
        {/* Traffic Lights Group */}
        <div
          className="traffic-lights-group flex items-center gap-2 pl-1 pr-2 py-1.5 cursor-default"
          onMouseEnter={() => setIsHoveringTrafficLights(true)}
          onMouseLeave={() => setIsHoveringTrafficLights(false)}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className={`traffic-light ${
              !isWindowActive
                ? "bg-[#CDCDCD] dark:bg-[#48484A]"
                : "bg-[#FF5F57] border border-[#E0443E]"
            }`}
            title="Close"
          >
            <svg
              className={`w-2 h-2 text-[#4D0000] ${
                isHoveringTrafficLights ? "opacity-100" : "opacity-0"
              }`}
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="2" y1="2" x2="8" y2="8" />
              <line x1="8" y1="2" x2="2" y2="8" />
            </svg>
          </button>

          {/* Minimize */}
          <button
            onClick={handleMinimize}
            className={`traffic-light ${
              !isWindowActive
                ? "bg-[#CDCDCD] dark:bg-[#48484A]"
                : "bg-[#FEBC2E] border border-[#DEA123]"
            }`}
            title="Minimize"
          >
            <svg
              className={`w-2 h-2 text-[#734200] ${
                isHoveringTrafficLights ? "opacity-100" : "opacity-0"
              }`}
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <line x1="2" y1="5" x2="8" y2="5" />
            </svg>
          </button>

          {/* Zoom / Maximize */}
          <button
            onClick={handleMaximize}
            className={`traffic-light ${
              !isWindowActive
                ? "bg-[#CDCDCD] dark:bg-[#48484A]"
                : "bg-[#28C840] border border-[#1AAB29]"
            }`}
            title={isWindowed ? "Maximize Window" : "Windowed View"}
          >
            <svg
              className={`w-2 h-2 text-[#004D11] ${
                isHoveringTrafficLights ? "opacity-100" : "opacity-0"
              }`}
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <line x1="2.5" y1="2.5" x2="7.5" y2="7.5" />
              <polyline points="4.5,2.5 7.5,2.5 7.5,5.5" />
              <polyline points="5.5,7.5 2.5,7.5 2.5,4.5" />
            </svg>
          </button>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors"
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
          className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors flex items-center gap-1.5"
          title="New Conversation (⌘N)"
          aria-label="New Conversation"
        >
          <SquarePen className="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>

      {/* Center: Draggable App Title & Active Chat Context */}
      <div className="flex-1 flex items-center justify-center px-4 max-w-[500px]">
        <div className="flex items-center gap-2 cursor-default truncate">
          <span className="font-semibold text-[13px] text-[var(--text-primary)] tracking-tight">
            {activeConversation?.title || "Ollama Desktop"}
          </span>
          {activeConversation?.model && (
            <span className="text-[11.5px] font-mono text-[var(--text-tertiary)]">
              • {activeConversation.model}
            </span>
          )}
        </div>
      </div>

      {/* Right: Ollama Status, Spotlight Search & Actions */}
      <div className="flex items-center gap-1.5">
        {/* Ollama Connection Indicator */}
        <button
          onClick={refreshOllamaStatus}
          className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title={
            ollamaStatus.connected
              ? `Ollama v${ollamaStatus.version || "active"} • ${ollamaStatus.models.length} model${
                  ollamaStatus.models.length === 1 ? "" : "s"
                }`
              : "Ollama is offline. Click to test connection."
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ollamaStatus.connected ? "bg-[#34C759]" : "bg-[#FF3B30]"
            }`}
          />
          <span className="hidden sm:inline font-normal">
            {ollamaStatus.connected
              ? `${ollamaStatus.models.length} model${ollamaStatus.models.length === 1 ? "" : "s"}`
              : "Offline"}
          </span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors text-[12px]"
          title="Spotlight Search & Actions (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px] text-[var(--text-tertiary)]">Search</span>
          <kbd className="kbd">⌘K</kbd>
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Keyboard Shortcuts (⌘/)"
        >
          <HelpCircle className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Settings Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Preferences (⌘,)"
        >
          <Settings className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Window Style Toggle */}
        {setIsWindowed && (
          <button
            onClick={() => setIsWindowed(!isWindowed)}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors hidden sm:flex"
            title={isWindowed ? "Expand Fullscreen" : "Switch to Windowed Frame"}
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
