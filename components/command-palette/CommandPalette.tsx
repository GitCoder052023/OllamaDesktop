"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import {
  Search,
  Plus,
  MessageSquare,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Trash2,
  Share2,
  ArrowRight,
} from "lucide-react";
import { OllamaLogo } from "@/components/ui/OllamaLogo";

interface PaletteItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

function CommandPaletteDialog() {
  const router = useRouter();
  const {
    setIsCommandPaletteOpen,
    conversations,
    selectConversation,
    createConversation,
    activeConversation,
    changeConversationModel,
    clearCurrentConversation,
    setIsShortcutsOpen,
    setIsSidebarOpen,
    updateSettings,
    ollamaStatus,
    exportData,
  } = useChat();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Command items
  const items = useMemo<PaletteItem[]>(() => {
    const q = query.toLowerCase();

    const actionItems: PaletteItem[] = [
      {
        id: "new_chat",
        category: "Actions",
        title: "New Conversation",
        icon: Plus,
        shortcut: "⌘N",
        run: () => {
          createConversation();
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "settings",
        category: "Actions",
        title: "Preferences...",
        icon: Settings,
        shortcut: "⌘,",
        run: () => {
          router.push("/settings");
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "shortcuts",
        category: "Actions",
        title: "Keyboard Shortcuts...",
        icon: HelpCircle,
        shortcut: "⌘/",
        run: () => {
          setIsShortcutsOpen(true);
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "toggle_sidebar",
        category: "Actions",
        title: "Toggle Sidebar",
        icon: ArrowRight,
        shortcut: "⌘B",
        run: () => {
          setIsSidebarOpen((p) => !p);
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "theme_light",
        category: "Theme",
        title: "Switch to Light Theme",
        icon: Sun,
        run: () => {
          updateSettings({ theme: "light" });
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "theme_dark",
        category: "Theme",
        title: "Switch to Dark Theme",
        icon: Moon,
        run: () => {
          updateSettings({ theme: "dark" });
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "theme_system",
        category: "Theme",
        title: "Match System Theme",
        icon: Laptop,
        run: () => {
          updateSettings({ theme: "system" });
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "export_chats",
        category: "Actions",
        title: "Export Conversations (JSON)",
        icon: Share2,
        run: () => {
          exportData();
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: "clear_chat",
        category: "Actions",
        title: "Clear Current Chat Messages",
        icon: Trash2,
        run: () => {
          clearCurrentConversation();
          setIsCommandPaletteOpen(false);
        },
      },
    ];

    // Model switchers
    const modelItems: PaletteItem[] = ollamaStatus.models.map((m) => ({
      id: `model_${m.name}`,
      category: "Switch Model",
      title: `Use ${m.name}`,
      subtitle: `${m.details.parameterSize || ""} ${m.isVision ? "• Vision" : ""}`,
      icon: Cpu,
      run: () => {
        if (activeConversation) {
          changeConversationModel(activeConversation.id, m.name);
        } else {
          createConversation(m.name);
        }
        setIsCommandPaletteOpen(false);
      },
    }));

    // Conversation switchers
    const convItems: PaletteItem[] = conversations.map((c) => ({
      id: `conv_${c.id}`,
      category: "Conversations",
      title: c.title,
      subtitle: `${c.model} • ${c.messages.length} messages`,
      icon: MessageSquare,
      run: () => {
        selectConversation(c.id);
        setIsCommandPaletteOpen(false);
      },
    }));

    const all = [...actionItems, ...modelItems, ...convItems];

    if (!q) return all;

    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [
    query,
    conversations,
    ollamaStatus.models,
    activeConversation,
    createConversation,
    selectConversation,
    changeConversationModel,
    clearCurrentConversation,
    router,
    setIsShortcutsOpen,
    setIsSidebarOpen,
    setIsCommandPaletteOpen,
    updateSettings,
    exportData,
  ]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].run();
      }
    } else if (e.key === "Escape") {
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-window)] overflow-hidden macos-vibrancy animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search conversations, models, or actions..."
            className="w-full bg-transparent border-0 outline-none text-[13.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="p-6 text-center text-[12.5px] text-[var(--text-tertiary)]">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[6px] text-[13px] cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-white" : "text-[var(--text-tertiary)]"
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span
                          className={`text-[11px] truncate ${
                            isSelected ? "text-white/80" : "text-[var(--text-tertiary)]"
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider ${
                        isSelected ? "text-white/70" : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd
                        className={`kbd ${
                          isSelected ? "!bg-white/20 !text-white !border-white/30" : ""
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[var(--surface-hover)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-1.5">
            <OllamaLogo className="w-3 h-3 text-[var(--accent)]" />
            <span className="font-semibold text-[10.5px] text-[var(--text-secondary)]">OllamaDesktop</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Navigate ↑ ↓</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const { isCommandPaletteOpen } = useChat();
  if (!isCommandPaletteOpen) return null;
  return <CommandPaletteDialog />;
}
