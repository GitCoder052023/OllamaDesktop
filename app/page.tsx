"use client";

import React, { useState, useEffect } from "react";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { WindowChrome } from "@/components/window/WindowChrome";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { DocumentSlideout } from "@/components/preview/DocumentSlideout";
import { ImageLightbox } from "@/components/modals/ImageLightbox";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { ShortcutsModal } from "@/components/modals/ShortcutsModal";
import { ToastContainer } from "@/components/ui/Toast";

function DesktopApp() {
  const {
    createConversation,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    setIsShortcutsOpen,
    setIsSidebarOpen,
    stopGeneration,
    isStreaming,
    previewDocument,
    setPreviewDocument,
    previewImage,
    setPreviewImage,
    isCommandPaletteOpen,
    isSettingsOpen,
    isShortcutsOpen,
    settings,
  } = useChat();

  const [isWindowed, setIsWindowed] = useState(false);

  useEffect(() => {
    if (settings.windowFrameStyle) {
      setIsWindowed(settings.windowFrameStyle === "windowed");
    }
  }, [settings.windowFrameStyle]);

  // Global macOS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;

      // ⌘N: New Chat
      if (isCmd && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createConversation();
        return;
      }

      // ⌘K: Command Palette
      if (isCmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // ⌘,: Preferences
      if (isCmd && e.key === ",") {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // ⌘/: Shortcuts Sheet
      if (isCmd && e.key === "/") {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // ⌘B: Toggle Sidebar
      if (isCmd && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((p) => !p);
        return;
      }

      // Esc: Dismiss modals or slideout or stop generation
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
          return;
        }
        if (previewImage) {
          setPreviewImage(null);
          return;
        }
        if (previewDocument) {
          setPreviewDocument(null);
          return;
        }
        if (isStreaming) {
          stopGeneration();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    createConversation,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    setIsShortcutsOpen,
    setIsSidebarOpen,
    stopGeneration,
    isStreaming,
    previewDocument,
    setPreviewDocument,
    previewImage,
    setPreviewImage,
    isCommandPaletteOpen,
    isSettingsOpen,
    isShortcutsOpen,
  ]);

  return (
    <div
      className={`h-screen w-screen overflow-hidden ${
        isWindowed
          ? "p-4 sm:p-8 md:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 flex items-center justify-center"
          : "bg-[var(--bg-primary)]"
      }`}
    >
      {/* App Window Container */}
      <div
        className={`flex flex-col h-full w-full overflow-hidden transition-all duration-300 ${
          isWindowed
            ? "max-w-6xl max-h-[92vh] rounded-[10px] border border-[var(--border)] shadow-[var(--shadow-window)] bg-[var(--bg-primary)]"
            : "rounded-none"
        }`}
      >
        {/* Title Bar & Traffic Lights */}
        <WindowChrome
          isWindowed={isWindowed}
          setIsWindowed={setIsWindowed}
        />

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Chat Interface */}
          <ChatContainer />

          {/* Detail Preview Slideout for Documents */}
          <DocumentSlideout />
        </div>
      </div>

      {/* Floating Modals & Overlays */}
      <CommandPalette />
      <SettingsModal />
      <ShortcutsModal />
      <ImageLightbox />
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <ChatProvider>
      <DesktopApp />
    </ChatProvider>
  );
}
