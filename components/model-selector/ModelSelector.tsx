"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import {
  Cpu,
  ChevronDown,
  Check,
  RefreshCw,
  AlertCircle,
  Copy,
  Search,
  X,
} from "lucide-react";

interface ModelSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  align?: "center" | "left" | "right";
  placement?: "top" | "bottom";
  buttonVariant?: "input" | "toolbar" | "pill";
}

export function ModelSelector({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  className = "",
  align = "left",
  placement = "top",
  buttonVariant = "input",
}: ModelSelectorProps) {
  const {
    activeConversation,
    changeConversationModel,
    createConversation,
    ollamaStatus,
    refreshOllamaStatus,
    showToast,
  } = useChat();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedPull, setCopiedPull] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = useCallback(
    (open: boolean) => {
      if (controlledOnClose && !open) {
        controlledOnClose();
      }
      setInternalIsOpen(open);
      if (!open) {
        setSearch("");
      }
    },
    [controlledOnClose]
  );

  // Close on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const currentModel = activeConversation?.model || (ollamaStatus.models[0]?.name ?? "qwen2.5-coder:7b");
  const activeModelObj = ollamaStatus.models.find((m) => m.name === currentModel);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refreshOllamaStatus();
    setIsRefreshing(false);
    showToast("Models refreshed from Ollama daemon", "info");
  };

  const handleSelectModel = (modelName: string) => {
    if (activeConversation) {
      changeConversationModel(activeConversation.id, modelName);
    } else {
      createConversation(modelName);
    }
    setIsOpen(false);
    showToast(`Active model: ${modelName}`, "info");
  };

  const handleCopyCmd = async (e: React.MouseEvent, cmd: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedPull(true);
      showToast("Command copied to clipboard", "success");
      setTimeout(() => setCopiedPull(false), 2000);
    } catch {
      // Fallback
    }
  };

  const filteredModels = ollamaStatus.models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.details.family.toLowerCase().includes(search.toLowerCase())
  );

  const triggerButtonClasses =
    buttonVariant === "input"
      ? `h-7 px-2.5 rounded-[6px] flex items-center gap-1.5 text-[11.5px] font-medium border transition-all select-none ${
          isOpen
            ? "bg-[var(--surface-active)] border-[var(--accent)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]/20 shadow-xs"
            : "bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
        }`
      : buttonVariant === "pill"
      ? `h-7 px-2.5 rounded-full flex items-center gap-1.5 text-[11.5px] font-medium border transition-all select-none ${
          isOpen
            ? "bg-[var(--surface-active)] border-[var(--accent)] text-[var(--text-primary)] shadow-xs"
            : "bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
        }`
      : `h-7 px-2 rounded-[6px] flex items-center gap-1.5 text-[12px] font-medium transition-colors select-none ${
          isOpen
            ? "bg-[var(--surface-active)] text-[var(--text-primary)]"
            : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]"
        }`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerButtonClasses}
        title="Select Model"
        aria-expanded={isOpen}
      >
        <Cpu className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
        <span className="font-mono text-[11px] truncate max-w-[130px] sm:max-w-[190px]">
          {currentModel}
        </span>
        {activeModelObj?.details.parameterSize && (
          <span className="text-[9.5px] font-sans px-1.5 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-secondary)] font-medium leading-none shrink-0 border border-[var(--border-subtle)]">
            {activeModelObj.details.parameterSize}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-tertiary)] shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Menu / Modal - Clean, Minimal & Snappy */}
      {isOpen && (
        <div
          className={`absolute ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } ${
            align === "center"
              ? "left-1/2 -translate-x-1/2"
              : align === "right"
              ? "right-0"
              : "left-0"
          } w-[310px] max-w-[calc(100vw-32px)] rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] p-0 z-50 macos-vibrancy animate-in fade-in zoom-in-95 duration-150 flex flex-col overflow-hidden select-none`}
        >
          {/* Header */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-titlebar)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                Models
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {ollamaStatus.models.length}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-[4px] hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Refresh models"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[var(--accent)]" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-[4px] hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Search Input */}
          {ollamaStatus.models.length > 2 && (
            <div className="p-1.5 border-b border-[var(--border-subtle)]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter models..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-transparent focus:border-[var(--accent)] rounded-[6px] pl-7 pr-6 py-1 text-[11.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:bg-[var(--bg-elevated)] transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Clean Model Selection List */}
          <div className="p-1.5 max-h-64 overflow-y-auto">
            {!ollamaStatus.connected ? (
              <div className="p-3 text-[11.5px] text-red-600 dark:text-red-400 bg-red-500/10 rounded-[6px] border border-red-500/20">
                <div className="flex items-center gap-1.5 font-medium mb-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ollama Offline</span>
                </div>
                <p className="text-[10.5px] opacity-90 leading-relaxed">
                  Start daemon via <code className="font-mono">ollama serve</code> in Terminal.
                </p>
              </div>
            ) : ollamaStatus.models.length === 0 ? (
              <div className="p-3 text-[11.5px] text-[var(--text-secondary)] bg-[var(--surface-hover)] rounded-[6px] border border-[var(--border)]">
                <p className="mb-1.5 font-medium text-[var(--text-primary)]">No local models</p>
                <div className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-1 rounded-[5px] text-[10.5px] font-mono">
                  <code>ollama pull qwen2.5-coder:7b</code>
                  <button
                    onClick={(e) => handleCopyCmd(e, "ollama pull qwen2.5-coder:7b")}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                    title="Copy command"
                  >
                    {copiedPull ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="p-3 text-center text-[11px] text-[var(--text-tertiary)]">
                No models match &quot;{search}&quot;
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredModels.map((m) => {
                  const isSelected = m.name === currentModel;
                  return (
                    <button
                      key={m.name}
                      onClick={() => handleSelectModel(m.name)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-[var(--surface-selected)] text-[var(--accent)] font-medium"
                          : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate font-mono text-[12px]">{m.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {m.details.parameterSize && (
                            <span className="font-sans px-1 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-secondary)]">
                              {m.details.parameterSize}
                            </span>
                          )}
                          {m.details.quantizationLevel && (
                            <span>{m.details.quantizationLevel}</span>
                          )}
                          <span>•</span>
                          <span>{(m.size / 1e9).toFixed(1)} GB</span>
                          {m.isVision && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Vision</span>
                            </>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
