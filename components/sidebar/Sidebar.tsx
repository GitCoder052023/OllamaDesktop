"use client";

import React, { useState, useMemo } from "react";
import { useChat } from "@/context/ChatContext";
import { Conversation } from "@/types/chat";
import {
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
} from "lucide-react";

const emptySubscribe = () => () => {};

export function Sidebar() {
  const clientNow = React.useSyncExternalStore(
    emptySubscribe,
    () => Date.now(),
    () => null
  );

  const {
    conversations,
    activeId,
    selectConversation,
    createConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    isSidebarOpen,
    searchQuery,
    setSearchQuery,
    ollamaStatus,
  } = useChat();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveEditing = (convId: string) => {
    if (editingTitle.trim()) {
      renameConversation(convId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  // Group conversations by time category
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => {
    const pinned: Conversation[] = [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    if (!clientNow) {
      for (const conv of filteredConversations) {
        if (conv.pinned) pinned.push(conv);
        else today.push(conv);
      }
      return { pinned, today, yesterday, last7Days, older };
    }

    const now = new Date(clientNow);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfLast7Days = startOfToday - 7 * 86400000;

    for (const conv of filteredConversations) {
      if (conv.pinned) {
        pinned.push(conv);
        continue;
      }
      const time = conv.updatedAt || conv.createdAt;
      if (time >= startOfToday) {
        today.push(conv);
      } else if (time >= startOfYesterday) {
        yesterday.push(conv);
      } else if (time >= startOfLast7Days) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    }

    return { pinned, today, yesterday, last7Days, older };
  }, [filteredConversations, clientNow]);

  if (!isSidebarOpen) return null;

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-3">
        <div className="px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)] tracking-wider uppercase select-none">
          {title}
        </div>
        <div className="space-y-[1px] mt-0.5">
          {items.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`group relative flex items-center justify-between px-2 py-1.5 rounded-[6px] text-[12.5px] cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[var(--surface-active)] font-medium text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {/* Active Indicator & Icon */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {isActive && (
                    <span className="w-1 h-3 rounded-full bg-[var(--accent)] shrink-0" />
                  )}
                  {conv.pinned ? (
                    <Pin className="w-3 h-3 text-[var(--accent)] shrink-0 fill-[var(--accent)]/30" />
                  ) : (
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[var(--accent)] opacity-90" : "opacity-40"}`} />
                  )}

                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing(conv.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-[4px] px-1.5 py-0.5 text-[11.5px] text-[var(--text-primary)] outline-none"
                      />
                      <button
                        onClick={() => saveEditing(conv.id)}
                        className="p-0.5 hover:text-[var(--text-primary)] text-emerald-500"
                        title="Save title"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-0.5 hover:text-[var(--text-primary)] text-red-500"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate flex-1 text-[12px] leading-tight select-none">
                      {conv.title}
                    </span>
                  )}
                </div>

                {/* Contextual actions on hover */}
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinConversation(conv.id);
                      }}
                      className="p-1 rounded-[3px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors"
                      title={conv.pinned ? "Unpin chat" : "Pin chat"}
                    >
                      <Pin className={`w-3 h-3 ${conv.pinned ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => startEditing(conv, e)}
                      className="p-1 rounded-[3px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors"
                      title="Rename chat"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 rounded-[3px] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--surface-active)] transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[260px] min-w-[260px] max-w-[260px] h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)] macos-vibrancy select-none z-20">
      {/* Integrated Search & New Chat Header */}
      <div className="p-2 border-b border-[var(--border)] flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] focus:bg-[var(--bg-elevated)] border border-transparent focus:border-[var(--accent)] rounded-[6px] pl-6.5 pr-6 py-1 text-[11.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={() => createConversation()}
          className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors shrink-0"
          title="New Chat (⌘N)"
          aria-label="New Chat"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <MessageSquare className="w-6 h-6 text-[var(--text-tertiary)] stroke-[1.5] mb-2 opacity-40" />
            <p className="text-[12px] font-medium text-[var(--text-secondary)]">No conversations</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
              Press <kbd className="kbd">⌘N</kbd> to begin
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-[11.5px] text-[var(--text-tertiary)]">
            No chats matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <>
            {renderSection("Pinned", grouped.pinned)}
            {renderSection("Today", grouped.today)}
            {renderSection("Yesterday", grouped.yesterday)}
            {renderSection("Previous 7 Days", grouped.last7Days)}
            {renderSection("Older", grouped.older)}
          </>
        )}
      </div>

      {/* Footer System Status - Quiet and Useful */}
      <div className="px-2.5 py-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-sidebar)]">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ollamaStatus.connected ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span className="text-[10.5px]">
            {ollamaStatus.connected ? "Local engine ready" : "Ollama offline"}
          </span>
        </div>
        <span className="text-[10px] font-medium">
          {conversations.length} {conversations.length === 1 ? "chat" : "chats"}
        </span>
      </div>
    </aside>
  );
}
