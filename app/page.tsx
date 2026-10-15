"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { AppToolbar } from "@/components/toolbar/AppToolbar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { DocumentSlideout } from "@/components/preview/DocumentSlideout";
import { ImageLightbox } from "@/components/modals/ImageLightbox";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { ShortcutsModal } from "@/components/modals/ShortcutsModal";

export default function Home() {
  const router = useRouter();
  const {
    createConversation,
    setIsCommandPaletteOpen,
    setIsShortcutsOpen,
    setIsSidebarOpen,
    stopGeneration,
    isStreaming,
    previewDocument,
    setPreviewDocument,
    previewImage,
    setPreviewImage,
    isCommandPaletteOpen,
    isShortcutsOpen,
  } = useChat();

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

      // ⌘,: Navigate to Settings Page
      if (isCmd && e.key === ",") {
        e.preventDefault();
        router.push("/settings");
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
        setIsSidebarOpen((p: boolean) => !p);
        return;
      }

      // Esc: Dismiss modals or slideout or stop generation
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
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
    router,
    createConversation,
    setIsCommandPaletteOpen,
    setIsShortcutsOpen,
    setIsSidebarOpen,
    stopGeneration,
    isStreaming,
    previewDocument,
    setPreviewDocument,
    previewImage,
    setPreviewImage,
    isCommandPaletteOpen,
    isShortcutsOpen,
  ]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] flex flex-col">
      {/* Application Toolbar */}
      <AppToolbar />

      {/* Content Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Chat Interface */}
        <ChatContainer />

        {/* Detail Preview Slideout for Documents */}
        <DocumentSlideout />
      </div>

      {/* Floating Modals & Overlays */}
      <CommandPalette />
      <ShortcutsModal />
      <ImageLightbox />
    </div>
  );
}
