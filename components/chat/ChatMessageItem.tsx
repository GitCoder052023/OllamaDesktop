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
  Copy,
  Check,
  RotateCw,
  AlertTriangle,
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

  // Check if current active model supports vision
  const currentModelName = activeConversation?.model || message.model;
  const currentModelObj = ollamaStatus.models.find((m) => m.name === currentModelName);
  const modelSupportsVision = currentModelObj?.isVision ?? false;

  const hasImageAttachment =
    message.attachments && message.attachments.some((a) => a.fileType === "image");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      showToast("Copied message to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // -------------------------------------------------------------
  // USER MESSAGE PRESENTATION: Compact, right-aligned native bubble
  // -------------------------------------------------------------
  if (isUser) {
    return (
      <div className="py-2.5 flex flex-col items-end group">
        {/* User Attachments (if any) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2 mb-2 max-w-[85%] sm:max-w-[75%]">
            {message.attachments.map((att: Attachment) => {
              const isPdf = att.fileType === "pdf";
              const isImg = att.fileType === "image";
              const isCode = att.fileType === "code";

              if (isImg && att.previewUrl) {
                return (
                  <div
                    key={att.id}
                    onClick={() => setPreviewImage(att.previewUrl || null)}
                    className="group/img relative cursor-pointer rounded-[8px] overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] shadow-sm transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="h-20 w-auto max-w-[200px] object-cover group-hover/img:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[11px] font-medium transition-opacity">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Full
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={att.id}
                  onClick={() => setPreviewDocument(att)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-strong)] shadow-sm transition-all text-left text-[11.5px] group/att"
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
                    <span className="font-medium text-[var(--text-primary)] group-hover/att:text-[var(--accent)] transition-colors truncate max-w-[180px]">
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

        {/* User Text Bubble */}
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-sm bg-[var(--bubble-user-bg)] text-[var(--bubble-user-text)] border border-[var(--bubble-user-border)] px-4 py-2.5 shadow-[var(--shadow-sm)] text-[13.5px] leading-relaxed whitespace-pre-wrap selectable-text">
          {message.content}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ASSISTANT MESSAGE PRESENTATION: Continuous, book-like canvas
  // -------------------------------------------------------------
  return (
    <div className="py-4 flex flex-col group text-[var(--text-primary)]">
      {/* Multimodal Vision Advisory (if model lacks vision) */}
      {hasImageAttachment && !modelSupportsVision && (
        <div className="mb-3 p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[12px] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-semibold">Notice: Vision model required for image inspection</p>
            <p className="text-[11.5px] mt-0.5 opacity-90 leading-relaxed">
              The model <code className="font-mono">{currentModelName}</code> does not feature vision capabilities. To analyze images, switch to a vision model in the toolbar (e.g. <code className="font-mono">llama3.2-vision</code>).
            </p>
          </div>
        </div>
      )}

      {/* Main Assistant Content - Rendered directly on the canvas */}
      <div className="selectable-text markdown-body w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) {
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

        {/* Streaming Cursor Indicator */}
        {isStreaming && isLast && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-[var(--accent)] align-middle animate-pulse rounded-sm" />
        )}
      </div>

      {/* Message Footer: Actions & Generation Stats (Quiet hover/footnote) */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-tertiary)] select-none">
        {/* Subtle Generation Stats */}
        {message.stats ? (
          <div className="flex items-center gap-1.5 font-mono opacity-70">
            {message.stats.tokensPerSecond ? (
              <span className="font-medium text-[var(--text-secondary)]">
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
        ) : (
          <div />
        )}

        {/* Hover-Only Action Icons */}
        {isAssistant && !isStreaming && message.content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              title="Copy response"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 stroke-[1.8]" />
              )}
            </button>
            {isLast && (
              <button
                onClick={regenerateLastMessage}
                className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Regenerate response"
                aria-label="Regenerate message"
              >
                <RotateCw className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
