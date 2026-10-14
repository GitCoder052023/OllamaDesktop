"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import { SlidersHorizontal, RotateCcw, X, Sparkles } from "lucide-react";

interface SessionParametersPopoverProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  align?: "left" | "center" | "right";
  buttonVariant?: "toolbar" | "compact" | "icon";
}

export function SessionParametersPopover({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  className = "",
  align = "center",
  buttonVariant = "toolbar",
}: SessionParametersPopoverProps) {
  const { activeConversation, updateConversationParameters, settings, showToast } = useChat();

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

  const handleTemperatureChange = (val: number) => {
    if (activeConversation) {
      updateConversationParameters(activeConversation.id, { temperature: val });
    }
  };

  const handleContextLengthChange = (val: number | undefined) => {
    if (activeConversation) {
      updateConversationParameters(activeConversation.id, { contextLength: val });
      showToast(val ? `Context window set to ${(val / 1024).toFixed(0)}K` : "Context window set to model default", "info");
    }
  };

  const handleSystemPromptChange = (val: string) => {
    if (activeConversation) {
      updateConversationParameters(activeConversation.id, { systemPrompt: val });
    }
  };

  const handleResetDefaults = () => {
    if (activeConversation) {
      updateConversationParameters(activeConversation.id, {
        temperature: undefined,
        contextLength: undefined,
        systemPrompt: undefined,
      });
      showToast("Reset session parameters to global defaults", "info");
    }
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
      {/* Trigger Button */}
      {buttonVariant === "icon" || buttonVariant === "compact" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-7 w-7 rounded-[6px] flex items-center justify-center transition-colors relative ${
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
          className={`h-7 px-2 rounded-[6px] flex items-center gap-1.5 text-[11.5px] font-mono border transition-all ${
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
            align === "center"
              ? "left-1/2 -translate-x-1/2"
              : align === "right"
              ? "right-0"
              : "left-0"
          } mt-2 w-[340px] max-w-[92vw] rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] p-3.5 z-50 macos-vibrancy animate-in fade-in zoom-in-95 select-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                Session Parameters
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetDefaults}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between mb-1 text-[12px]">
                <span className="font-medium text-[var(--text-primary)]">Temperature</span>
                <span className="font-mono text-[11.5px] font-semibold text-[var(--accent)]">
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
              <p className="text-[10.5px] text-[var(--text-tertiary)] mt-1">
                {getTemperatureDescriptor(currentTemperature)}
              </p>
            </div>

            {/* Context Window (num_ctx) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[12px]">
                <span className="font-medium text-[var(--text-primary)]">Context Window</span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  {currentContextLength ? `${(currentContextLength / 1024).toFixed(0)}K tokens` : "Model Default"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {contextOptions.map((opt) => {
                  const isSelected = currentContextLength === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleContextLengthChange(opt.value)}
                      className={`py-1 rounded text-[11px] font-mono transition-colors ${
                        isSelected
                          ? "bg-[var(--accent)] text-white font-medium shadow-sm"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
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
              <div className="flex items-center justify-between mb-1 text-[12px]">
                <span className="font-medium text-[var(--text-primary)]">System Instructions</span>
                {currentSystemPrompt && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Custom</span>
                )}
              </div>
              <textarea
                value={currentSystemPrompt}
                onChange={(e) => handleSystemPromptChange(e.target.value)}
                rows={3}
                placeholder="Define role or behavior rules for this chat session..."
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] p-2 text-[11.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider mb-1.5">
                Quick Presets
              </div>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      if (activeConversation) {
                        updateConversationParameters(activeConversation.id, {
                          temperature: preset.temp,
                          systemPrompt: preset.prompt,
                        });
                        showToast(`Loaded ${preset.name} preset`, "info");
                      }
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[4px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] transition-colors flex items-center justify-between text-[11.5px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                      <span className="font-medium text-[var(--text-primary)]">{preset.name}</span>
                    </div>
                    <span className="font-mono text-[10.5px] text-[var(--text-tertiary)]">
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
