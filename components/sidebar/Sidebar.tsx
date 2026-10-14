"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Sparkles,
  Cpu,
  Layers,
} from "lucide-react";

export function Sidebar() {
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
  const [nowTime, setNowTime] = useState<number | null>(null);

  useEffect(() => {
    setNowTime(Date.now());
  }, []);

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

    if (!nowTime) {
      for (const conv of filteredConversations) {
        if (conv.pinned) pinned.push(conv);
        else today.push(conv);
      }
      return { pinned, today, yesterday, last7Days, older };
    }

    const now = new Date(nowTime);
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
  }, [filteredConversations]);

  if (!isSidebarOpen) return null;

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-tertiary)] tracking-wider uppercase">
          {title}
        </div>
        <div className="space-y-0.5 mt-0.5">
          {items.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-all ${
                  isActive
                    ? "bg-[var(--surface-active)] font-medium text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {conv.pinned ? (
                    <Pin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 fill-[var(--accent)]/20" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
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
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-[4px] px-1.5 py-0.5 text-[12px] text-[var(--text-primary)] outline-none"
                      />
                      <button
                        onClick={() => saveEditing(conv.id)}
                        className="p-1 hover:text-[var(--text-primary)]"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      </button>
                      <button onClick={cancelEditing} className="p-1 hover:text-[var(--text-primary)]">
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate flex-1">{conv.title}</span>
                  )}
                </div>

                {/* Right: Actions on hover */}
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinConversation(conv.id);
                      }}
                      className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
                      title={conv.pinned ? "Unpin chat" : "Pin chat"}
                    >
                      <Pin className={`w-3 h-3 ${conv.pinned ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => startEditing(conv, e)}
                      className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
                      title="Rename chat"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--surface-active)]"
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
    <aside className="w-[250px] min-w-[250px] max-w-[250px] h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)] macos-vibrancy select-none z-20">
      {/* Search Header */}
      <div className="p-3 pb-2 space-y-2">
        <button
          onClick={() => createConversation()}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-primary)] text-[12px] font-medium shadow-[var(--shadow-sm)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-all"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            New Chat
          </span>
          <kbd className="kbd">⌘N</kbd>
        </button>

        {/* Filter input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] pl-8 pr-2.5 py-1 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <MessageSquare className="w-8 h-8 text-[var(--text-tertiary)] stroke-[1.5] mb-2 opacity-50" />
            <p className="text-[12px] text-[var(--text-tertiary)]">No conversations yet</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
              Press <kbd className="kbd">⌘N</kbd> to begin
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-[12px] text-[var(--text-tertiary)]">
            No chats match &quot;{searchQuery}&quot;
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

      {/* Footer System Status */}
      <div className="p-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 truncate">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="truncate">
            {ollamaStatus.models.length > 0
              ? `${ollamaStatus.models[0].name.split(":")[0]}`
              : "No models"}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
          {conversations.length} chat{conversations.length === 1 ? "" : "s"}
        </span>
      </div>
    </aside>
  );
}
