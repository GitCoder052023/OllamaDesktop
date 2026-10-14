"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Conversation,
  ChatMessage,
  Attachment,
  OllamaStatus,
  AppSettings,
  MessageStats,
} from "@/types/chat";
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveId,
  saveStoredActiveId,
  getStoredSettings,
  saveStoredSettings,
  exportAllData,
  importAllData,
} from "@/lib/storage";

interface ToastInfo {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeId: string | null;
  ollamaStatus: OllamaStatus;
  settings: AppSettings;
  isStreaming: boolean;
  toasts: ToastInfo[];
  previewDocument: Attachment | null;
  previewImage: string | null;
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;
  isShortcutsOpen: boolean;
  isSidebarOpen: boolean;
  searchQuery: string;
  // Actions
  selectConversation: (id: string) => void;
  createConversation: (model?: string) => Conversation;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  clearCurrentConversation: () => void;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  regenerateLastMessage: () => Promise<void>;
  stopGeneration: () => void;
  changeConversationModel: (conversationId: string, model: string) => void;
  updateConversationParameters: (
    id: string,
    params: { systemPrompt?: string; temperature?: number; contextLength?: number }
  ) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
  dismissToast: (id: string) => void;
  setPreviewDocument: (att: Attachment | null) => void;
  setPreviewImage: (url: string | null) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsShortcutsOpen: (open: boolean) => void;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setSearchQuery: (query: string) => void;
  refreshOllamaStatus: () => Promise<void>;
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; count: number; error?: string };
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Apply theme to document
  const applyTheme = (theme: "system" | "light" | "dark") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  };

  const [conversations, setConversations] = useState<Conversation[]>(() => getStoredConversations());
  const [activeId, setActiveId] = useState<string | null>(() => {
    const stored = getStoredActiveId();
    const storedConvs = getStoredConversations();
    if (stored && storedConvs.some((c) => c.id === stored)) return stored;
    return storedConvs.length > 0 ? storedConvs[0].id : null;
  });
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    connected: false,
    host: "http://127.0.0.1:11434",
    version: null,
    models: [],
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [previewDocument, setPreviewDocument] = useState<Attachment | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "info") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Poll Ollama status
  const refreshOllamaStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(settings.ollamaHost)}`);
      const data: OllamaStatus = await res.json();
      setOllamaStatus(data);
    } catch {
      setOllamaStatus({
        connected: false,
        host: settings.ollamaHost,
        version: null,
        models: [],
        error: "Cannot connect to Ollama",
      });
    }
  }, [settings.ollamaHost]);

  // Initial setup and polling
  useEffect(() => {
    applyTheme(settings.theme);

    let isMounted = true;
    const check = async () => {
      try {
        const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(settings.ollamaHost)}`);
        const data: OllamaStatus = await res.json();
        if (isMounted) setOllamaStatus(data);
      } catch {
        if (isMounted) {
          setOllamaStatus({
            connected: false,
            host: settings.ollamaHost,
            version: null,
            models: [],
            error: "Cannot connect to Ollama",
          });
        }
      }
    };

    void check();

    const interval = setInterval(check, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [settings.ollamaHost, settings.theme]);

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        saveStoredSettings(updated);
        if (newSettings.theme) {
          applyTheme(newSettings.theme);
        }
        return updated;
      });
      showToast("Preferences saved", "success");
    },
    [showToast]
  );

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Create new conversation
  const createConversation = useCallback(
    (chosenModel?: string): Conversation => {
      const availableModel =
        chosenModel ||
        (ollamaStatus.models.length > 0 ? ollamaStatus.models[0].name : settings.defaultModel);

      const newConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: "New Chat",
        model: availableModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };

      setConversations((prev) => {
        const updated = [newConv, ...prev];
        saveStoredConversations(updated);
        return updated;
      });

      setActiveId(newConv.id);
      saveStoredActiveId(newConv.id);
      return newConv;
    },
    [ollamaStatus.models, settings.defaultModel]
  );

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    saveStoredActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveStoredConversations(updated);

        if (activeId === id) {
          const nextActive = updated.length > 0 ? updated[0].id : null;
          setActiveId(nextActive);
          saveStoredActiveId(nextActive);
        }
        return updated;
      });
      showToast("Chat deleted", "info");
    },
    [activeId, showToast]
  );

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c
      );
      saveStoredConversations(updated);
      return updated;
    });
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      saveStoredConversations(updated);
      return updated;
    });
  }, []);

  const clearCurrentConversation = useCallback(() => {
    if (!activeId) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c
      );
      saveStoredConversations(updated);
      return updated;
    });
    showToast("Chat cleared", "info");
  }, [activeId, showToast]);

  const changeConversationModel = useCallback((conversationId: string, model: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId ? { ...c, model, updatedAt: Date.now() } : c
      );
      saveStoredConversations(updated);
      return updated;
    });
  }, []);

  const updateConversationParameters = useCallback(
    (
      id: string,
      params: { systemPrompt?: string; temperature?: number; contextLength?: number }
    ) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, ...params, updatedAt: Date.now() } : c
        );
        saveStoredConversations(updated);
        return updated;
      });
    },
    []
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    showToast("Generation stopped", "info");
  }, [showToast]);

  // Send message and stream response from Ollama
  const sendMessage = useCallback(
    async (content: string, attachments: Attachment[] = []) => {
      if ((!content.trim() && attachments.length === 0) || isStreaming) return;

      let currentConvId = activeId;
      let targetConv = activeConversation;

      // If no active conversation, create one
      if (!currentConvId || !targetConv) {
        const newConv = createConversation();
        currentConvId = newConv.id;
        targetConv = newConv;
      }

      const userMsgId = `msg_${Date.now()}_u`;
      const assistantMsgId = `msg_${Date.now()}_a`;
      const timestamp = Date.now();

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content,
        timestamp,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const initialAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: timestamp + 1,
        model: targetConv.model,
      };

      // Determine new title if this is the first message
      let newTitle = targetConv.title;
      if (targetConv.messages.length === 0) {
        const preview = content.trim() || attachments[0]?.name || "New Chat";
        newTitle = preview.length > 36 ? preview.substring(0, 36) + "…" : preview;
      }

      // Add messages to state
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === currentConvId) {
            return {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
              messages: [...c.messages, userMessage, initialAssistantMessage],
            };
          }
          return c;
        });
        saveStoredConversations(updated);
        return updated;
      });

      // Prepare context for Ollama
      // Build document context injection
      let combinedContent = content;
      const docAttachments = attachments.filter((a) => a.fileType !== "image");
      const imgAttachments = attachments.filter((a) => a.fileType === "image");

      if (docAttachments.length > 0) {
        const docContextParts = docAttachments.map((doc) => {
          const typeLabel = doc.fileType === "pdf" ? `PDF Document (${doc.pageCount || 1} pages)` : `${doc.name}`;
          return `--- Attached Document: ${doc.name} (${typeLabel}) ---\n${doc.extractedText}\n--- End of ${doc.name} ---`;
        });
        combinedContent = `${docContextParts.join("\n\n")}\n\n${content ? `User Inquiry:\n${content}` : "Please review and analyze the attached document(s)."}`;
      }

      // Prepare images for Ollama vision
      const imagesPayload: string[] = [];
      for (const img of imgAttachments) {
        if (img.base64Data) {
          imagesPayload.push(img.base64Data);
        }
      }

      // Construct message history for Ollama
      interface ChatPayloadMessage {
        role: string;
        content: string;
        images?: string[];
      }

      const history: ChatPayloadMessage[] = targetConv.messages.map((m) => {
        const item: ChatPayloadMessage = {
          role: m.role,
          content: m.content,
        };
        if (m.attachments) {
          const imgs = m.attachments.filter((a) => a.fileType === "image" && a.base64Data);
          if (imgs.length > 0) {
            item.images = imgs.map((i) => i.base64Data as string);
          }
        }
        return item;
      });

      const userPayloadItem: ChatPayloadMessage = {
        role: "user",
        content: combinedContent,
      };
      if (imagesPayload.length > 0) {
        userPayloadItem.images = imagesPayload;
      }

      const effectiveSystemPrompt = targetConv.systemPrompt || settings.systemPrompt;
      const fullMessages: ChatPayloadMessage[] = [];
      if (effectiveSystemPrompt) {
        fullMessages.push({
          role: "system",
          content: effectiveSystemPrompt,
        });
      }
      fullMessages.push(...history, userPayloadItem);

      setIsStreaming(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let accumulatedContent = "";
      let finalStats: MessageStats | undefined;

      try {
        const optionsPayload: Record<string, unknown> = {
          temperature: targetConv.temperature ?? settings.temperature,
        };
        if (targetConv.contextLength) {
          optionsPayload.num_ctx = targetConv.contextLength;
        }

        const response = await fetch("/api/ollama/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: targetConv.model,
            messages: fullMessages,
            host: settings.ollamaHost,
            options: optionsPayload,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Ollama error (${response.status})`);
        }

        if (!response.body) {
          throw new Error("No response body received from Ollama stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const chunk = JSON.parse(line);

              if (chunk.message?.content) {
                accumulatedContent += chunk.message.content;

                // Update assistant message content in state
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id === currentConvId) {
                      return {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMsgId
                            ? { ...m, content: accumulatedContent }
                            : m
                        ),
                      };
                    }
                    return c;
                  })
                );
              }

              if (chunk.done) {
                // Calculate stats
                const evalCount = chunk.eval_count || 0;
                const evalDuration = chunk.eval_duration || 0;
                const totalDuration = chunk.total_duration || 0;
                const promptEvalCount = chunk.prompt_eval_count || 0;
                let tokensPerSecond: number | undefined;

                if (evalCount > 0 && evalDuration > 0) {
                  // eval_duration is in nanoseconds
                  tokensPerSecond = Math.round((evalCount / (evalDuration / 1e9)) * 10) / 10;
                }

                finalStats = {
                  evalCount,
                  evalDuration,
                  totalDuration,
                  tokensPerSecond,
                  promptEvalCount,
                };
              }
            } catch {
              // Line may be split across chunks; ignore
            }
          }
        }

        // Final update with stats & persist
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id === currentConvId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: accumulatedContent,
                        stats: finalStats,
                      }
                    : m
                ),
              };
            }
            return c;
          });
          saveStoredConversations(updated);
          return updated;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User aborted; persist whatever was received
          setConversations((prev) => {
            saveStoredConversations(prev);
            return prev;
          });
        } else {
          const errorMessage = err instanceof Error ? err.message : "Failed to generate response";
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id === currentConvId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: accumulatedContent
                            ? `${accumulatedContent}\n\n*[Connection error: ${errorMessage}]*`
                            : `**Error:** ${errorMessage}\n\nPlease verify that Ollama is running and that the model \`${targetConv?.model}\` is installed.`,
                          error: true,
                        }
                      : m
                  ),
                };
              }
              return c;
            });
            saveStoredConversations(updated);
            return updated;
          });
          showToast(errorMessage, "error");
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [activeId, activeConversation, createConversation, isStreaming, settings, showToast]
  );

  // Regenerate last message
  const regenerateLastMessage = useCallback(async () => {
    if (!activeConversation || isStreaming || activeConversation.messages.length === 0) return;

    const msgs = activeConversation.messages;
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg.role === "assistant") {
      // Find previous user message
      const prevUserMsg = msgs[msgs.length - 2];
      if (prevUserMsg && prevUserMsg.role === "user") {
        // Remove the last assistant message
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id === activeConversation.id) {
              return {
                ...c,
                messages: c.messages.slice(0, -1),
              };
            }
            return c;
          });
          saveStoredConversations(updated);
          return updated;
        });

        // Re-send user message
        await sendMessage(prevUserMsg.content, prevUserMsg.attachments);
      }
    }
  }, [activeConversation, isStreaming, sendMessage]);

  const exportData = useCallback(() => {
    const jsonStr = exportAllData();
    showToast("Conversations exported", "success");
    return jsonStr;
  }, [showToast]);

  const importData = useCallback(
    (jsonStr: string) => {
      const res = importAllData(jsonStr);
      if (res.success) {
        const loaded = getStoredConversations();
        setConversations(loaded);
        if (loaded.length > 0) {
          setActiveId(loaded[0].id);
        }
        showToast(`Successfully imported ${res.count} conversations`, "success");
      } else {
        showToast(`Import failed: ${res.error}`, "error");
      }
      return res;
    },
    [showToast]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeId,
        ollamaStatus,
        settings,
        isStreaming,
        toasts,
        previewDocument,
        previewImage,
        isCommandPaletteOpen,
        isSettingsOpen,
        isShortcutsOpen,
        isSidebarOpen,
        searchQuery,
        selectConversation,
        createConversation,
        deleteConversation,
        renameConversation,
        togglePinConversation,
        clearCurrentConversation,
        sendMessage,
        regenerateLastMessage,
        stopGeneration,
        changeConversationModel,
        updateConversationParameters,
        updateSettings,
        showToast,
        dismissToast,
        setPreviewDocument,
        setPreviewImage,
        setIsCommandPaletteOpen,
        setIsSettingsOpen,
        setIsShortcutsOpen,
        setIsSidebarOpen,
        setSearchQuery,
        refreshOllamaStatus,
        exportData,
        importData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
