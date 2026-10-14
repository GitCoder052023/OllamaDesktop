"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage, Attachment } from "@/types/chat";
import { useChat } from "@/context/ChatContext";
import { CodeBlock } from "./CodeBlock";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  Zap,
  ExternalLink,
} from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
  isLast: boolean;
}

export function ChatMessageItem({ message, isLast }: ChatMessageItemProps) {
  const {
    isStreaming,
    regenerateLastMessage,
    setPreviewDocument,
    setPreviewImage,
    showToast,
    ollamaStatus,
    activeConversation,
  } = useChat();

  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // Check if this model supports vision
  const currentModelName = activeConversation?.model || message.model;
  const currentModelObj = ollamaStatus.models.find((m) => m.name === currentModelName);
  const modelSupportsVision = currentModelObj?.isVision ?? false;

  const hasImageAttachment =
    message.attachments && message.attachments.some((a) => a.fileType === "image");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 border-b border-[var(--border)] transition-colors ${
        isUser
          ? "bg-transparent"
          : "bg-[var(--surface-hover)]/40"
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5 select-none">
          {isUser ? (
            <div className="w-7 h-7 rounded-[7px] bg-[var(--surface-active)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
              <User className="w-4 h-4 stroke-[1.8]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-[7px] bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shadow-none">
              <Bot className="w-4 h-4 stroke-[1.8]" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Role & Model */}
          <div className="flex items-center justify-between mb-1.5 select-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] text-[var(--text-primary)]">
                {isUser ? "You" : "Ollama"}
              </span>
              {!isUser && message.model && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]">
                  {message.model}
                </span>
              )}
            </div>

            {/* Quick Actions for Assistant */}
            {isAssistant && !isStreaming && message.content && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {isLast && (
                  <button
                    onClick={regenerateLastMessage}
                    className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Attachments List */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att) => {
                const isPdf = att.fileType === "pdf";
                const isImg = att.fileType === "image";
                const isCode = att.fileType === "code";

                if (isImg && att.previewUrl) {
                  return (
                    <div
                      key={att.id}
                      onClick={() => setPreviewImage(att.previewUrl!)}
                      className="group relative cursor-pointer rounded-[8px] overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] shadow-sm transition-all"
                    >
                      <img
                        src={att.previewUrl}
                        alt={att.name}
                        className="h-24 w-auto max-w-[200px] object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-medium transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Full
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={att.id}
                    onClick={() => setPreviewDocument(att)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] shadow-sm transition-all text-left text-[12px] group"
                    title="Click to view extracted context"
                  >
                    {isPdf ? (
                      <span className="p-1 rounded bg-red-500/15 text-red-600 dark:text-red-400">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    ) : isCode ? (
                      <span className="p-1 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <FileCode className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate max-w-[220px]">
                        {att.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {isPdf
                          ? `${att.pageCount || 1} page${att.pageCount === 1 ? "" : "s"} • ${(att.size / 1024).toFixed(0)} KB`
                          : `${att.lineCount || 1} lines • ${(att.size / 1024).toFixed(0)} KB`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Vision Capability Advisory for Non-Vision Models */}
          {isAssistant && hasImageAttachment && !modelSupportsVision && (
            <div className="mb-3 p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[12px] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-semibold">Notice: Vision model required for image analysis</p>
                <p className="text-[11.5px] mt-0.5 opacity-90">
                  The active model <code className="font-mono">{currentModelName}</code> does not have native multimodal vision capabilities. To analyze images, run <code className="font-mono">ollama run llama3.2-vision</code> or switch to a vision model in the model selector.
                </p>
              </div>
            </div>
          )}

          {/* Message Text Content */}
          <div className="selectable-text text-[13.5px] leading-relaxed text-[var(--text-primary)]">
            {isUser ? (
              <div className="inline-block bg-[var(--surface-hover)] border border-[var(--border)] px-3.5 py-2 rounded-[8px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap max-w-2xl">
                {message.content}
              </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !String(children).includes("\n");

                      if (isInline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : "text"}
                          code={String(children).replace(/\n$/, "")}
                        />
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Streaming Cursor */}
                {isStreaming && isLast && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[var(--accent)] align-middle animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>

          {/* Assistant Generation Stats Footer */}
          {isAssistant && message.stats && (
            <div className="mt-3 pt-1.5 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] select-none font-mono">
              {message.stats.tokensPerSecond ? (
                <span className="text-[var(--text-secondary)]">
                  {message.stats.tokensPerSecond} tok/s
                </span>
              ) : null}
              {message.stats.evalCount ? (
                <span>• {message.stats.evalCount} tokens</span>
              ) : null}
              {message.stats.totalDuration ? (
                <span>• {(message.stats.totalDuration / 1e9).toFixed(2)}s</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
