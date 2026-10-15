"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import { SlidersHorizontal, RotateCcw, X, Sparkles } from "lucide-react";

interface SessionParametersPopoverProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  align?: "left" | "center" | "right";
  placement?: "top" | "bottom";
  buttonVariant?: "toolbar" | "compact" | "icon" | "input";
}

export function SessionParametersPopover({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  className = "",
  align = "left",
  placement = "top",
  buttonVariant = "input",
}: SessionParametersPopoverProps) {
  const {
    activeConversation,
    createConversation,
    updateConversationParameters,
    settings,
    showToast,
  } = useChat();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
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

  const currentTemperature = activeConversation?.temperature ?? settings.temperature ?? 0.7;
  const currentContextLength = activeConversation?.contextLength;
  const currentSystemPrompt = activeConversation?.systemPrompt ?? settings.systemPrompt ?? "";

  // Helper to ensure we have a conversation before setting parameters
  const ensureConversation = () => {
    if (activeConversation) return activeConversation;
    return createConversation();
  };

  const handleTemperatureChange = (val: number) => {
    const conv = ensureConversation();
    updateConversationParameters(conv.id, { temperature: val });
  };

  const handleContextLengthChange = (val: number | undefined) => {
    const conv = ensureConversation();
    updateConversationParameters(conv.id, { contextLength: val });
    showToast(
      val ? `Context window set to ${(val / 1024).toFixed(0)}K` : "Context window set to model default",
      "info"
    );
  };

  const handleSystemPromptChange = (val: string) => {
    const conv = ensureConversation();
    updateConversationParameters(conv.id, { systemPrompt: val });
  };

  const handleResetDefaults = () => {
    const conv = ensureConversation();
    updateConversationParameters(conv.id, {
      temperature: undefined,
      contextLength: undefined,
      systemPrompt: undefined,
    });
    showToast("Reset session parameters to global defaults", "info");
  };

  const getTemperatureDescriptor = (temp: number) => {
    if (temp <= 0.25) return "Deterministic • Code & Exact Logic";
    if (temp <= 0.65) return "Focused • Analysis & Technical Q&A";
    if (temp <= 0.95) return "Balanced • General Conversation";
    return "Creative • Diverse & Exploratory";
  };

  const contextOptions: { label: string; value: number | undefined }[] = [
    { label: "Default", value: undefined },
    { label: "4K", value: 4096 },
    { label: "8K", value: 8192 },
    { label: "16K", value: 16384 },
    { label: "32K", value: 32768 },
  ];

  const presets = [
    {
      name: "Code Specialist",
      temp: 0.2,
      prompt: "You are an expert software engineer. Provide concise, production-ready, type-safe solutions with clear explanations.",
    },
    {
      name: "Concise Technical",
      temp: 0.5,
      prompt: "Provide direct, factual, and concise technical answers. Skip introductory pleasantries.",
    },
    {
      name: "Creative Explorer",
      temp: 1.0,
      prompt: "Brainstorm creative, multidimensional ideas and explore alternative perspectives.",
    },
  ];

  const hasCustomParams = Boolean(
    activeConversation &&
      (activeConversation.temperature !== undefined ||
        activeConversation.contextLength !== undefined ||
        activeConversation.systemPrompt !== undefined)
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button Variants */}
      {buttonVariant === "input" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-7 px-2 rounded-[6px] flex items-center gap-1.5 text-[11.5px] font-medium border transition-all select-none ${
            isOpen || hasCustomParams
              ? "bg-[var(--surface-active)] border-[var(--accent)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]/20 shadow-xs"
              : "bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
          }`}
          title={`Generation Parameters (${getTemperatureDescriptor(currentTemperature)})${
            hasCustomParams ? " • Custom parameters active" : ""
          }`}
          aria-expanded={isOpen}
          aria-label="Generation Parameters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="font-mono text-[10.5px] text-[var(--text-secondary)]">
            T:{currentTemperature.toFixed(2)}
          </span>
          {hasCustomParams && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
          )}
        </button>
      ) : buttonVariant === "icon" || buttonVariant === "compact" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-7 w-7 rounded-[6px] flex items-center justify-center transition-colors relative select-none ${
            isOpen || hasCustomParams
              ? "bg-[var(--surface-active)] text-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]"
          }`}
          title={`Generation Parameters (${getTemperatureDescriptor(currentTemperature)})${
            hasCustomParams ? " • Custom parameters active" : ""
          }`}
          aria-expanded={isOpen}
          aria-label="Generation Parameters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.8]" />
          {hasCustomParams && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] ring-1 ring-[var(--bg-toolbar)]" />
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-7 px-2.5 rounded-[6px] flex items-center gap-1.5 text-[11.5px] font-mono border transition-all select-none ${
            isOpen || hasCustomParams
              ? "bg-[var(--surface-active)] border-[var(--accent)] text-[var(--text-primary)]"
              : "bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
          title="Session Generation Parameters (Temperature, Context, System Prompt)"
          aria-expanded={isOpen}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-sans font-medium text-[11px] hidden sm:inline">Parameters</span>
          <span className="px-1 py-0.2 rounded bg-[var(--surface-active)] text-[10px] text-[var(--text-secondary)]">
            T:{currentTemperature.toFixed(2)}
          </span>
        </button>
      )}

      {/* Popover Card */}
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
          } w-[340px] max-w-[calc(100vw-32px)] rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] p-3.5 z-50 macos-vibrancy animate-in fade-in zoom-in-95 duration-150 flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border-subtle)] select-none">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                Session Parameters
              </span>
              {hasCustomParams && (
                <span className="text-[9.5px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  Modified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetDefaults}
                className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[12px] select-none">
                <span className="font-medium text-[var(--text-primary)]">Temperature</span>
                <span className="font-mono text-[11.5px] font-semibold text-[var(--accent)] px-1.5 py-0.2 rounded bg-[var(--surface-active)]">
                  {currentTemperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={currentTemperature}
                onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)] h-1.5 bg-[var(--surface-active)] rounded-lg cursor-pointer"
              />
              <p className="text-[10.5px] text-[var(--text-tertiary)] mt-1 select-none">
                {getTemperatureDescriptor(currentTemperature)}
              </p>
            </div>

            {/* Context Window (num_ctx) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[12px] select-none">
                <span className="font-medium text-[var(--text-primary)]">Context Window</span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  {currentContextLength ? `${(currentContextLength / 1024).toFixed(0)}K tokens` : "Model Default"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 select-none">
                {contextOptions.map((opt) => {
                  const isSelected = currentContextLength === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleContextLengthChange(opt.value)}
                      className={`py-1 rounded-[4px] text-[11px] font-mono transition-colors ${
                        isSelected
                          ? "bg-[var(--accent)] text-white font-medium shadow-xs"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Prompt Customization */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[12px] select-none">
                <span className="font-medium text-[var(--text-primary)]">System Instructions</span>
                {currentSystemPrompt && (
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-medium px-1.5 py-0.2 rounded bg-emerald-500/10">
                    Active
                  </span>
                )}
              </div>
              <textarea
                value={currentSystemPrompt}
                onChange={(e) => handleSystemPromptChange(e.target.value)}
                rows={2}
                placeholder="Custom persona, formatting constraints, or behavioral rules..."
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] p-2 text-[11.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-elevated)] resize-none transition-colors"
              />
            </div>

            {/* Quick Presets */}
            <div className="select-none pt-1 border-t border-[var(--border-subtle)]">
              <div className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider mb-1.5">
                Quick Presets
              </div>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      const conv = ensureConversation();
                      updateConversationParameters(conv.id, {
                        temperature: preset.temp,
                        systemPrompt: preset.prompt,
                      });
                      showToast(`Loaded ${preset.name} preset`, "info");
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[5px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between text-[11.5px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                      <span className="font-medium text-[var(--text-primary)]">{preset.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                      T:{preset.temp}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
