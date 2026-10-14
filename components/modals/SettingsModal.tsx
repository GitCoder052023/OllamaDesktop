"use client";

import React, { useState, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { AppSettings } from "@/types/chat";
import {
  X,
  Server,
  Sliders,
  Palette,
  Database,
  RefreshCw,
  Download,
  Upload,
  Cpu,
  Sun,
  Moon,
} from "lucide-react";

type Tab = "ollama" | "parameters" | "appearance" | "data";

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    ollamaStatus,
    refreshOllamaStatus,
    exportData,
    importData,
  } = useChat();

  const [activeTab, setActiveTab] = useState<Tab>("ollama");
  const [hostInput, setHostInput] = useState(settings.ollamaHost);
  const [tempDefaultModel, setTempDefaultModel] = useState(settings.defaultModel);
  const [tempTemperature, setTempTemperature] = useState(settings.temperature);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(settings.systemPrompt);
  const [isTesting, setIsTesting] = useState(false);

  const importFileRef = useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  const handleSaveOllama = async () => {
    setIsTesting(true);
    updateSettings({ ollamaHost: hostInput });
    await refreshOllamaStatus();
    setIsTesting(false);
  };

  const handleSaveParameters = () => {
    updateSettings({
      defaultModel: tempDefaultModel,
      temperature: tempTemperature,
      systemPrompt: tempSystemPrompt,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) {
      importFileRef.current.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-window)] overflow-hidden macos-vibrancy animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Window Titlebar */}
        <div className="h-[48px] px-4 border-b border-[var(--border)] bg-[var(--bg-titlebar)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[13px] text-[var(--text-primary)]">
              Preferences
            </span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apple Segmented Control Tabs */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-4 p-1 rounded-[8px] bg-[var(--surface-hover)] border border-[var(--border)] text-[12px]">
            <button
              onClick={() => setActiveTab("ollama")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] font-medium transition-all ${
                activeTab === "ollama"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Ollama</span>
            </button>

            <button
              onClick={() => setActiveTab("parameters")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] font-medium transition-all ${
                activeTab === "parameters"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Model</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] font-medium transition-all ${
                activeTab === "appearance"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme</span>
            </button>

            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] font-medium transition-all ${
                activeTab === "data"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 pt-4 min-h-[360px] max-h-[500px] overflow-y-auto">
          {/* TAB 1: OLLAMA */}
          {activeTab === "ollama" && (
            <div className="space-y-5 text-[13px]">
              <div>
                <label className="block font-medium text-[var(--text-primary)] mb-1.5">
                  Ollama Service Host
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hostInput}
                    onChange={(e) => setHostInput(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                    className="flex-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] px-3 py-1.5 text-[13px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={handleSaveOllama}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-[12px] shadow-sm transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                    <span>Save & Test</span>
                  </button>
                </div>
                <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1.5">
                  Default: <code className="font-mono">http://127.0.0.1:11434</code>. Must point to your running Ollama daemon.
                </p>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-[8px] border flex items-center justify-between ${
                  ollamaStatus.connected
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      ollamaStatus.connected ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-[13px]">
                      {ollamaStatus.connected ? "Ollama Connected" : "Ollama Offline"}
                    </span>
                    <p className="text-[11.5px] opacity-80 mt-0.5">
                      {ollamaStatus.connected
                        ? `Ollama v${ollamaStatus.version || "active"} • ${ollamaStatus.models.length} local models discovered`
                        : "Cannot connect. Verify that Ollama is installed and running (`ollama serve`)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Installed Models Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--text-primary)]">
                    Local Models ({ollamaStatus.models.length})
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    Pull more: <code className="font-mono">ollama pull &lt;name&gt;</code>
                  </span>
                </div>

                <div className="rounded-[8px] border border-[var(--border)] overflow-hidden">
                  {ollamaStatus.models.length === 0 ? (
                    <div className="p-4 text-center text-[12px] text-[var(--text-tertiary)]">
                      No models detected. Run <code className="font-mono">ollama pull qwen2.5-coder:7b</code> in Terminal.
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border)] text-[12px]">
                      {ollamaStatus.models.map((m) => (
                        <div
                          key={m.name}
                          className="px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[var(--accent)]" />
                            <div className="flex flex-col">
                              <span className="font-mono font-medium text-[var(--text-primary)]">
                                {m.name}
                              </span>
                              <span className="text-[11px] text-[var(--text-tertiary)]">
                                {m.details.family} {m.details.parameterSize ? `• ${m.details.parameterSize}` : ""} • {m.details.quantizationLevel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {m.isVision && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Vision
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                              {(m.size / 1e9).toFixed(1)} GB
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARAMETERS */}
          {activeTab === "parameters" && (
            <div className="space-y-5 text-[13px]">
              <div>
                <label className="block font-medium text-[var(--text-primary)] mb-1.5">
                  Default Model
                </label>
                <select
                  value={tempDefaultModel}
                  onChange={(e) => setTempDefaultModel(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] px-3 py-1.5 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-[var(--text-primary)]">Temperature</label>
                  <span className="font-mono text-[12px] text-[var(--accent)] font-semibold">
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
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mt-1">
                  <span>0.0 (Precise / Code)</span>
                  <span>0.7 (Balanced)</span>
                  <span>1.5 (Creative)</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--text-primary)] mb-1.5">
                  System Prompt
                </label>
                <textarea
                  value={tempSystemPrompt}
                  onChange={(e) => setTempSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[6px] p-3 text-[12.5px] leading-relaxed text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
                  placeholder="Instructions for the AI model..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveParameters}
                  className="px-4 py-1.5 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-medium shadow-sm transition-colors"
                >
                  Save Parameters
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: THEME */}
          {activeTab === "appearance" && (
            <div className="space-y-5 text-[13px]">
              <div>
                <label className="block font-medium text-[var(--text-primary)] mb-2">
                  Appearance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "system", label: "System", icon: Palette },
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                  ].map((item) => {
                    const isSelected = settings.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => updateSettings({ theme: item.id as AppSettings["theme"] })}
                        className={`p-3.5 rounded-[8px] border text-center flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--surface-hover)] shadow-sm text-[var(--accent)] font-semibold"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[12px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--text-primary)] mb-2">
                  Window Presentation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "full", label: "Full Viewport (macOS App)", desc: "Occupies whole window like native apps" },
                    { id: "windowed", label: "Windowed Frame", desc: "Simulates floating desktop window with shadow" },
                  ].map((item) => {
                    const isSelected = settings.windowFrameStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => updateSettings({ windowFrameStyle: item.id as AppSettings["windowFrameStyle"] })}
                        className={`p-3.5 rounded-[8px] border text-left flex flex-col gap-1 transition-all ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--surface-hover)] shadow-sm"
                            : "border-[var(--border)] hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <span className={`text-[12.5px] font-medium ${isSelected ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                          {item.label}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)]">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA */}
          {activeTab === "data" && (
            <div className="space-y-5 text-[13px]">
              <input
                type="file"
                ref={importFileRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />

              <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface-hover)] space-y-2">
                <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                  Export & Backup
                </div>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Download all your chat history and preferences as a JSON backup.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      const jsonStr = exportData();
                      const blob = new Blob([jsonStr], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ollama_desktop_backup_${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-medium shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface-hover)] space-y-2">
                <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                  Restore from Backup
                </div>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Import conversations from a previously exported JSON backup file.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => importFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-[12px] font-medium shadow-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Backup File...</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-[48px] px-6 border-t border-[var(--border)] bg-[var(--bg-titlebar)] flex items-center justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 rounded-[6px] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] text-[12px] font-medium border border-[var(--border)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
