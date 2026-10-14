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
} from "lucide-react";

interface ModelSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  align?: "center" | "left" | "right";
}

export function ModelSelector({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  className = "",
  align = "center",
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
  const setIsOpen = useCallback((open: boolean) => {
    if (controlledOnClose && !open) {
      controlledOnClose();
    }
    setInternalIsOpen(open);
  }, [controlledOnClose]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, setIsOpen]);

  const currentModel = activeConversation?.model || (ollamaStatus.models[0]?.name ?? "qwen2.5-coder:7b");
  const activeModelObj = ollamaStatus.models.find((m) => m.name === currentModel);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refreshOllamaStatus();
    setIsRefreshing(false);
    showToast("Models refreshed", "info");
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

  const filteredModels = ollamaStatus.models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.details.family.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border border-[var(--border)] transition-all text-[12px] font-medium text-[var(--text-primary)] select-none shadow-[var(--shadow-sm)]"
        title="Select AI Model"
        aria-expanded={isOpen}
      >
        <Cpu className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
        <span className="font-mono text-[11.5px] truncate max-w-[150px] sm:max-w-[200px]">{currentModel}</span>
        {activeModelObj?.details.parameterSize && (
          <span className="hidden sm:inline text-[10.5px] font-sans px-1 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-secondary)]">
            {activeModelObj.details.parameterSize}
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] ml-0.5 shrink-0" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className={`absolute ${align === "center" ? "left-1/2 -translate-x-1/2" : align === "right" ? "right-0" : "left-0"} mt-1.5 w-72 max-w-[90vw] rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] py-1.5 z-50 macos-vibrancy animate-in fade-in zoom-in-95 select-none`}>
          {/* Header */}
          <div className="px-3 py-1 flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Installed Models ({ollamaStatus.models.length})
            </span>
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              title="Refresh models from Ollama"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search if multiple models */}
          {ollamaStatus.models.length > 4 && (
            <div className="p-2 border-b border-[var(--border-subtle)]">
              <input
                type="text"
                placeholder="Filter models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[4px] px-2 py-0.5 text-[11.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* Model List */}
          {!ollamaStatus.connected ? (
            <div className="p-3 text-[12px] text-red-600 dark:text-red-400">
              <div className="flex items-center gap-1.5 font-medium mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Ollama Offline</span>
              </div>
              <p className="text-[11px] opacity-80">
                Cannot reach Ollama at {ollamaStatus.host}. Run <code className="font-mono">ollama serve</code> in Terminal.
              </p>
            </div>
          ) : ollamaStatus.models.length === 0 ? (
            <div className="p-3 text-[12px] text-[var(--text-secondary)]">
              <p className="mb-2">No local models detected. Pull one in Terminal:</p>
              <div className="flex items-center justify-between bg-[var(--surface-hover)] border border-[var(--border)] p-1.5 rounded text-[11px] font-mono">
                <code>ollama pull qwen2.5-coder:7b</code>
                <button
                  onClick={(e) => handleCopyCmd(e, "ollama pull qwen2.5-coder:7b")}
                  className="p-1 hover:text-[var(--accent)]"
                >
                  {copiedPull ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto py-1">
              {filteredModels.map((m) => {
                const isSelected = m.name === currentModel;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleSelectModel(m.name)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-[12.5px] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors ${
                      isSelected
                        ? "text-[var(--accent)] font-medium bg-[var(--surface-selected)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate font-mono text-[12px]">{m.name}</span>
                      <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--text-tertiary)] mt-0.5">
                        {m.details.parameterSize && <span>{m.details.parameterSize}</span>}
                        {m.details.quantizationLevel && (
                          <>
                            <span>•</span>
                            <span>{m.details.quantizationLevel}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{(m.size / 1e9).toFixed(1)} GB</span>
                        {m.isVision && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">Vision</span>
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
      )}
    </div>
  );
}
