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
  Eye,
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
  const setIsOpen = useCallback(
    (open: boolean) => {
      if (controlledOnClose && !open) {
        controlledOnClose();
      }
      setInternalIsOpen(open);
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
    showToast("Models refreshed from Ollama", "info");
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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 px-2 rounded-[6px] flex items-center gap-1.5 text-[12px] font-medium transition-colors select-none ${
          isOpen
            ? "bg-[var(--surface-active)] text-[var(--text-primary)]"
            : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]"
        }`}
        title="Active Model & Technical Specifications"
        aria-expanded={isOpen}
      >
        <Cpu className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 opacity-90" />
        <span className="font-mono text-[11.5px] truncate max-w-[130px] sm:max-w-[170px]">
          {currentModel}
        </span>
        {activeModelObj?.details.parameterSize && (
          <span className="hidden sm:inline text-[9.5px] font-sans px-1.5 py-0.5 rounded bg-[var(--surface-active)] text-[var(--text-secondary)] font-medium leading-none">
            {activeModelObj.details.parameterSize}
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] ml-0.5 shrink-0 opacity-70" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "center"
              ? "left-1/2 -translate-x-1/2"
              : align === "right"
              ? "right-0"
              : "left-0"
          } mt-2 w-[340px] max-w-[92vw] rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] py-2 z-50 macos-vibrancy animate-in fade-in zoom-in-95 select-none`}
        >
          {/* Header */}
          <div className="px-3 py-1 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Installed Models ({ollamaStatus.models.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Refresh models from Ollama daemon"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Active Model Technical Spec Card */}
          {activeModelObj && (
            <div className="m-2 p-2.5 rounded-[8px] bg-[var(--surface-hover)] border border-[var(--border)] text-[11px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-semibold text-[12px] text-[var(--text-primary)] truncate">
                  {activeModelObj.name}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium px-1.5 py-0.2 rounded bg-emerald-500/10">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-[10.5px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <span className="text-[var(--text-tertiary)]">Architecture:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {activeModelObj.details.family || "GGUF"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[var(--text-tertiary)]">Parameters:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {activeModelObj.details.parameterSize || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[var(--text-tertiary)]">Quantization:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {activeModelObj.details.quantizationLevel || "None"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[var(--text-tertiary)]">Size:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {(activeModelObj.size / 1e9).toFixed(2)} GB
                  </span>
                </div>
                {activeModelObj.details.contextLength && (
                  <div className="flex items-center gap-1 col-span-2">
                    <span className="text-[var(--text-tertiary)]">Max Context:</span>
                    <span className="font-mono text-[var(--text-primary)]">
                      {(activeModelObj.details.contextLength / 1024).toFixed(0)}K tokens ({activeModelObj.details.contextLength.toLocaleString()})
                    </span>
                  </div>
                )}
                {activeModelObj.isVision && (
                  <div className="flex items-center gap-1 col-span-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Eye className="w-3 h-3" />
                    <span>Multimodal Vision Capable</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search if multiple models */}
          {ollamaStatus.models.length > 3 && (
            <div className="px-2 pb-2">
              <input
                type="text"
                placeholder="Filter models by name or family..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] px-2.5 py-1 text-[11.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* Model List */}
          {!ollamaStatus.connected ? (
            <div className="p-3 text-[12px] text-red-600 dark:text-red-400">
              <div className="flex items-center gap-1.5 font-medium mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Ollama Daemon Offline</span>
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
            <div className="max-h-56 overflow-y-auto px-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                Switch Active Model
              </div>
              {filteredModels.map((m) => {
                const isSelected = m.name === currentModel;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleSelectModel(m.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center justify-between text-[12px] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors ${
                      isSelected
                        ? "text-[var(--accent)] font-medium bg-[var(--surface-selected)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate font-mono text-[12px]">{m.name}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] mt-0.5">
                        {m.details.parameterSize && <span>{m.details.parameterSize}</span>}
                        {m.details.quantizationLevel && (
                          <>
                            <span>•</span>
                            <span>{m.details.quantizationLevel}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{(m.size / 1e9).toFixed(1)} GB</span>
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
