"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { X } from "lucide-react";
import { OllamaLogo } from "@/components/ui/OllamaLogo";

export function ShortcutsModal() {
  const { isShortcutsOpen, setIsShortcutsOpen } = useChat();

  if (!isShortcutsOpen) return null;

  const shortcutGroups = [
    {
      title: "Navigation & Global",
      shortcuts: [
        { label: "New Conversation", keys: ["⌘", "N"] },
        { label: "Command Palette / Quick Actions", keys: ["⌘", "K"] },
        { label: "Search Conversations", keys: ["⌘", "F"] },
        { label: "Toggle Sidebar", keys: ["⌘", "B"] },
        { label: "Preferences & Ollama Settings", keys: ["⌘", ","] },
        { label: "Keyboard Shortcuts Sheet", keys: ["⌘", "/"] },
        { label: "Dismiss Modal / Slideout", keys: ["Esc"] },
      ],
    },
    {
      title: "Chat & Composition",
      shortcuts: [
        { label: "Send Message", keys: ["↵"] },
        { label: "Insert New Line", keys: ["⇧", "↵"] },
        { label: "Halt Streaming Response", keys: ["Esc"] },
        { label: "Attach Files", keys: ["Drag & Drop"] },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setIsShortcutsOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-window)] overflow-hidden macos-vibrancy animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="h-[48px] px-4 border-b border-[var(--border)] bg-[var(--bg-titlebar)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[5px] bg-[var(--surface-active)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-xs">
              <OllamaLogo className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-[13px] text-[var(--text-primary)]">
              Ollama<span className="text-[var(--accent)]">Desktop</span> Shortcuts
            </span>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-6 max-h-[460px] overflow-y-auto">
          {shortcutGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2.5">
                {group.title}
              </h3>
              <div className="space-y-1 rounded-[8px] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
                {group.shortcuts.map((sc, sidx) => (
                  <div
                    key={sidx}
                    className="flex items-center justify-between px-3.5 py-2 text-[12.5px] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <span className="text-[var(--text-primary)]">{sc.label}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, kidx) => (
                        <kbd key={kidx} className="kbd font-mono text-[11px]">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-[44px] px-6 border-t border-[var(--border)] bg-[var(--bg-titlebar)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <span>Native macOS shortcuts</span>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-3 py-1 rounded-[6px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] font-medium border border-[var(--border)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
