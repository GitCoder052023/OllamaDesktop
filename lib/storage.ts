import { Conversation, AppSettings } from "@/types/chat";

const CONVERSATIONS_KEY = "ollama_desktop_conversations_v1";
const ACTIVE_CONV_KEY = "ollama_desktop_active_conv_v1";
const SETTINGS_KEY = "ollama_desktop_settings_v1";

export const DEFAULT_SETTINGS: AppSettings = {
  ollamaHost: "http://127.0.0.1:11434",
  defaultModel: "qwen2.5-coder:7b",
  temperature: 0.7,
  systemPrompt: "You are a helpful, brilliant, and precise AI assistant running natively on macOS via Ollama.",
  theme: "system",
  windowFrameStyle: "full",
  soundEffects: false,
};

export function getStoredConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load conversations from storage", e);
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error("Failed to save conversations to storage", e);
  }
}

export function getStoredActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_CONV_KEY);
  } catch {
    return null;
  }
}

export function saveStoredActiveId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONV_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  } catch {}
}

export function getStoredSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings to storage", e);
  }
}

export function exportAllData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    conversations: getStoredConversations(),
    settings: getStoredSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.conversations || !Array.isArray(data.conversations)) {
      return { success: false, count: 0, error: "Invalid backup format: missing conversations array" };
    }
    saveStoredConversations(data.conversations);
    if (data.settings) {
      saveStoredSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    return { success: true, count: data.conversations.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Failed to parse JSON file" };
  }
}
