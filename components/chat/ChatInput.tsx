"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Attachment } from "@/types/chat";
import {
  ArrowUp,
  Square,
  Paperclip,
  FileText,
  FileCode,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  externalText?: string;
}

export function ChatInput({ onSendMessage, externalText }: ChatInputProps) {
  const {
    activeConversation,
    isStreaming,
    stopGeneration,
    showToast,
    ollamaStatus,
  } = useChat();

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external text (e.g. from empty state prompt clicks)
  useEffect(() => {
    if (externalText) {
      setInput(externalText);
      textareaRef.current?.focus();
    }
  }, [externalText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (isStreaming) {
      stopGeneration();
      return;
    }

    if (!input.trim() && attachments.length === 0) return;

    onSendMessage(input, attachments);
    setInput("");
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Process uploaded files through server API
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/process-file", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to process file");
        }

        newAttachments.push(data);
        showToast(`Attached ${file.name}`, "success");
      } catch (err: any) {
        showToast(err.message || `Error processing ${file.name}`, "error");
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    setIsProcessingFile(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const currentModel = activeConversation?.model || "qwen2.5-coder:7b";

  return (
    <div className="p-3 md:p-4 max-w-3xl mx-auto w-full select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.txt,.md,.json,.csv,.js,.jsx,.ts,.tsx,.py,.html,.css,.yaml,.yml,.sh,.png,.jpg,.jpeg,.webp"
        className="hidden"
      />

      {/* Main Input Card Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) {
            handleUploadFiles(e.dataTransfer.files);
          }
        }}
        className={`relative rounded-[10px] bg-[var(--bg-elevated)] border transition-colors ${
          isDragOver
            ? "drop-zone-active"
            : "border-[var(--border-strong)] focus-within:border-[var(--accent)] shadow-[var(--shadow-sm)]"
        }`}
      >
        {/* Pending Attachments Tray */}
        {(attachments.length > 0 || isProcessingFile) && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 pb-0 border-b border-[var(--border)]/60">
            {attachments.map((att) => {
              const isPdf = att.fileType === "pdf";
              const isImg = att.fileType === "image";
              const isCode = att.fileType === "code";

              return (
                <div
                  key={att.id}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] text-[11px] text-[var(--text-primary)]"
                >
                  {isImg && att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : isPdf ? (
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                  ) : isCode ? (
                    <FileCode className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                  )}

                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {isPdf ? `${att.pageCount}p` : `${(att.size / 1024).toFixed(0)}KB`}
                  </span>

                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {isProcessingFile && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--surface-hover)] text-[11px] text-[var(--text-secondary)]">
                <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
                <span>Processing document...</span>
              </div>
            )}
          </div>
        )}

        {/* Text Area */}
        <div className="p-2.5 flex items-end gap-2">
          {/* File Attach Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile || isStreaming}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors disabled:opacity-40 shrink-0"
            title="Attach documents, PDFs, or images"
          >
            <Paperclip className="w-4 h-4 stroke-[1.8]" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={`Message ${currentModel}... (Shift+Enter for newline)`}
            className="selectable-text flex-1 max-h-[180px] min-h-[24px] py-1 bg-transparent border-0 outline-none resize-none text-[13.5px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
          />

          {/* Send / Stop Button */}
          {isStreaming ? (
            <button
              onClick={stopGeneration}
              className="w-7 h-7 rounded-full bg-[#FF3B30] hover:bg-[#E0342A] text-white flex items-center justify-center transition-colors shrink-0"
              title="Stop Generation (Esc)"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() && attachments.length === 0}
              className="w-7 h-7 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-30 disabled:hover:bg-[var(--accent)] flex items-center justify-center transition-colors shrink-0"
              title="Send Message (Enter)"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Shortcut & Privacy Note */}
      <div className="mt-1.5 px-2 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
        <span>Runs completely local via Ollama</span>
        <div className="flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="kbd">↵</kbd>
          <span>to send</span>
        </div>
      </div>
    </div>
  );
}
