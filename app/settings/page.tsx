"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { AppSettings } from "@/types/chat";
import {
  ArrowLeft,
  Server,
  Sliders,
  Palette,
  RefreshCw,
  Cpu,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const {
    settings,
    updateSettings,
    ollamaStatus,
    refreshOllamaStatus,
    showToast,
  } = useChat();

  const [hostInput, setHostInput] = useState(settings.ollamaHost);
  const [tempDefaultModel, setTempDefaultModel] = useState(settings.defaultModel);
  const [tempTemperature, setTempTemperature] = useState(settings.temperature);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(settings.systemPrompt);
  const [isTesting, setIsTesting] = useState(false);
  const [savedParams, setSavedParams] = useState(false);

  // Sync state if settings change externally per React 19 render-time pattern
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setHostInput(settings.ollamaHost);
    setTempDefaultModel(settings.defaultModel);
    setTempTemperature(settings.temperature);
    setTempSystemPrompt(settings.systemPrompt);
  }

  // Keyboard navigation: Esc or ⌘, returns to chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || ((e.metaKey || e.ctrlKey) && e.key === ",")) {
        e.preventDefault();
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleSaveOllama = async () => {
    setIsTesting(true);
    updateSettings({ ollamaHost: hostInput });
    await refreshOllamaStatus();
    setIsTesting(false);
    showToast("Ollama host updated and checked", "info");
  };

  const handleSaveParameters = () => {
    updateSettings({
      defaultModel: tempDefaultModel,
      temperature: tempTemperature,
      systemPrompt: tempSystemPrompt,
    });
    setSavedParams(true);
    showToast("Model parameters saved as defaults", "success");
    setTimeout(() => setSavedParams(false), 2000);
  };

  const getTemperatureDescriptor = (temp: number) => {
    if (temp <= 0.25) return "Deterministic • Precise Code & Exact Logic";
    if (temp <= 0.65) return "Focused • Technical Analysis & Direct Answers";
    if (temp <= 0.95) return "Balanced • Standard Conversational Tone";
    return "Creative • Diverse & Exploratory Generation";
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] flex flex-col">
      {/* Settings Titlebar Header */}
      <header className="h-[44px] min-h-[44px] select-none border-b border-[var(--border)] bg-[var(--bg-toolbar)] macos-vibrancy flex items-center justify-between px-3 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="h-7 px-2.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors flex items-center gap-1.5 text-[12px] font-medium"
            title="Return to Chat (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
            <span>Back to Chat</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            Settings
          </span>
        </div>

        <div className="w-[100px]" />
      </header>

        {/* Desktop-Optimized 2-Column Content Layout (Fits into screen with minimal to no scrolling) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 bg-[var(--bg-primary)]">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Compact Header with Status Indicator */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div>
                <h1 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">
                  Application Settings
                </h1>
                <p className="text-[11.5px] text-[var(--text-secondary)]">
                  Configure local daemon connectivity, default generation parameters, and theme appearance.
                </p>
              </div>

              {/* Status Pill */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[11px]">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    ollamaStatus.connected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                  }`}
                />
                <span className="font-medium text-[var(--text-primary)]">
                  {ollamaStatus.connected
                    ? `Ollama v${ollamaStatus.version || "active"} • Online`
                    : "Daemon Offline"}
                </span>
              </div>
            </div>

            {/* 2-Column Desktop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* COLUMN 1: OLLAMA DAEMON & INSTALLED MODELS */}
              <div className="space-y-4">
                {/* Card 1: Connection Endpoint & Health */}
                <div className="rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-[12.5px] text-[var(--text-primary)]">
                      <Server className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Ollama Service Endpoint</span>
                    </div>
                    <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
                      127.0.0.1:11434
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hostInput}
                      onChange={(e) => setHostInput(e.target.value)}
                      placeholder="http://127.0.0.1:11434"
                      className="flex-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] px-2.5 py-1 text-[12px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      onClick={handleSaveOllama}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-[11.5px] shadow-xs transition-colors shrink-0 disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin" : ""}`} />
                      <span>Save & Test</span>
                    </button>
                  </div>

                  <div
                    className={`px-2.5 py-1.5 rounded-[6px] border flex items-center justify-between text-[11px] ${
                      ollamaStatus.connected
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
                    }`}
                  >
                    <span>
                      {ollamaStatus.connected
                        ? `Connected (${ollamaStatus.models.length} model${
                            ollamaStatus.models.length === 1 ? "" : "s"
                          } discovered)`
                        : "Cannot connect. Run `ollama serve` in Terminal."}
                    </span>
                  </div>
                </div>

                {/* Card 2: Installed Models (Compact Scrollable Table) */}
                <div className="rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden shadow-xs">
                  <div className="px-3.5 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-titlebar)]">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="font-semibold text-[12px] text-[var(--text-primary)]">
                        Installed Models
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        {ollamaStatus.models.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      ollama pull &lt;name&gt;
                    </span>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto divide-y divide-[var(--border-subtle)] text-[11.5px]">
                    {ollamaStatus.models.length === 0 ? (
                      <div className="p-4 text-center text-[11.5px] text-[var(--text-tertiary)]">
                        No models installed yet. Pull one via Terminal.
                      </div>
                    ) : (
                      ollamaStatus.models.map((m) => (
                        <div
                          key={m.name}
                          className="px-3 py-2 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-mono font-medium text-[12px] text-[var(--text-primary)] truncate">
                              {m.name}
                            </span>
                            {m.details.family && (
                              <span className="font-mono uppercase text-[9px] px-1 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-tertiary)] shrink-0">
                                {m.details.family}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {m.details.parameterSize && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                {m.details.parameterSize}
                              </span>
                            )}
                            {m.isVision && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Vision
                              </span>
                            )}
                            <span className="font-mono text-[10.5px] text-[var(--text-tertiary)] w-14 text-right">
                              {(m.size / 1e9).toFixed(1)} GB
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* COLUMN 2: GENERATION DEFAULTS & APPEARANCE */}
              <div className="space-y-4">
                {/* Card 3: Model Generation Defaults */}
                <div className="rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-1.5 font-medium text-[12.5px] text-[var(--text-primary)]">
                      <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Model Defaults</span>
                    </div>
                  </div>

                  {/* Default Model */}
                  <div>
                    <label className="block text-[11.5px] font-medium text-[var(--text-secondary)] mb-1">
                      Default Model
                    </label>
                    <select
                      value={tempDefaultModel}
                      onChange={(e) => setTempDefaultModel(e.target.value)}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] px-2.5 py-1 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono"
                    >
                      {ollamaStatus.models.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} ({m.details.parameterSize || "local"})
                        </option>
                      ))}
                      {!ollamaStatus.models.some((m) => m.name === tempDefaultModel) && (
                        <option value={tempDefaultModel}>{tempDefaultModel}</option>
                      )}
                    </select>
                  </div>

                  {/* Temperature Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11.5px]">
                      <label className="font-medium text-[var(--text-secondary)]">Temperature</label>
                      <span className="font-mono text-[11px] text-[var(--accent)] font-semibold px-1.5 py-0.2 rounded bg-[var(--surface-active)]">
                        {tempTemperature.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.05"
                      value={tempTemperature}
                      onChange={(e) => setTempTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[var(--accent)] h-1.5 bg-[var(--surface-active)] rounded-lg cursor-pointer"
                    />
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                      {getTemperatureDescriptor(tempTemperature)}
                    </p>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <label className="block text-[11.5px] font-medium text-[var(--text-secondary)] mb-1">
                      Default System Instructions
                    </label>
                    <textarea
                      value={tempSystemPrompt}
                      onChange={(e) => setTempSystemPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] p-2 text-[11.5px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] resize-none"
                      placeholder="Behavioral constraints, persona, or instructions..."
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleSaveParameters}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11.5px] font-medium shadow-xs transition-colors"
                    >
                      {savedParams ? <Check className="w-3 h-3" /> : null}
                      <span>{savedParams ? "Saved" : "Save Defaults"}</span>
                    </button>
                  </div>
                </div>

                {/* Card 4: Appearance & Presentation */}
                <div className="rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[12.5px] text-[var(--text-primary)] pb-1.5 border-b border-[var(--border-subtle)]">
                    <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Appearance</span>
                  </div>

                  <div>
                    {/* Theme row */}
                    <div className="flex items-center justify-between text-[11.5px]">
                      <div>
                        <span className="font-medium text-[var(--text-primary)]">Color Theme</span>
                        <p className="text-[10px] text-[var(--text-tertiary)]">Follow macOS or lock theme</p>
                      </div>
                      <div className="inline-flex rounded-[6px] p-0.5 bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                        {[
                          { id: "system", label: "System" },
                          { id: "light", label: "Light" },
                          { id: "dark", label: "Dark" },
                        ].map((item) => {
                          const isSelected = settings.theme === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => updateSettings({ theme: item.id as AppSettings["theme"] })}
                              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition-all ${
                                isSelected
                                  ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-xs font-semibold"
                                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
