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
  User,
  Bot,
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

  // Check if current active model supports vision
  const currentModelName = activeConversation?.model || message.model || "qwen2.5-coder:7b";
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

  const formatTime = (ts: number) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // -------------------------------------------------------------
  // USER TURN: Cohesive reading alignment matching the conversation column
  // -------------------------------------------------------------
  if (isUser) {
    return (
      <div className="py-3 sm:py-4 w-full group">
        {/* User Turn Header */}
        <div className="flex items-center justify-between mb-1.5 px-0.5 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-[4px] bg-[var(--surface-active)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
              <User className="w-3 h-3 stroke-[2]" />
            </div>
            <span className="font-semibold text-[12px] text-[var(--text-primary)]">You</span>
            <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
              {formatTime(message.timestamp)}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
            title="Copy prompt"
            aria-label="Copy prompt"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 stroke-[1.8]" />}
          </button>
        </div>

        {/* User Turn Body Container */}
        <div className="w-full rounded-xl bg-[var(--surface-user-msg)] border border-[var(--border-user-msg)] p-3.5 sm:p-4 text-[14px] leading-relaxed text-[var(--text-primary)] selectable-text shadow-[var(--shadow-sm)]">
          {/* User Attachments (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
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
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] shadow-sm transition-all text-left text-[11.5px] group/att"
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
                      <span className="font-medium text-[var(--text-primary)] group-hover/att:text-[var(--accent)] transition-colors truncate max-w-[220px]">
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

          {/* User Prompt Text */}
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ASSISTANT TURN: Cohesive reading alignment matching the conversation column
  // -------------------------------------------------------------
  return (
    <div className="py-3 sm:py-4 w-full group text-[var(--text-primary)]">
      {/* Assistant Turn Header */}
      <div className="flex items-center justify-between mb-2 px-0.5 select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-[4px] bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <span className="font-semibold text-[12px] text-[var(--text-primary)] font-mono">
            {message.model || currentModelName}
          </span>
          {currentModelObj?.details.parameterSize && (
            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-tertiary)] font-medium">
              {currentModelObj.details.parameterSize}
            </span>
          )}
          <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Contextual Actions */}
        {!isStreaming && message.content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              title="Copy response"
              aria-label="Copy response"
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
                className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <RotateCw className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Multimodal Vision Advisory (if model lacks vision) */}
      {hasImageAttachment && !modelSupportsVision && (
        <div className="mb-3 p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[12px] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-semibold">Notice: Vision model required for image inspection</p>
            <p className="text-[11.5px] mt-0.5 opacity-90 leading-relaxed">
              The model <code className="font-mono">{currentModelName}</code> does not feature vision capabilities. To analyze images, switch to a vision model (e.g. <code className="font-mono">llama3.2-vision</code>).
            </p>
          </div>
        </div>
      )}

      {/* Assistant Response Body: Clean Markdown on Canvas */}
      <div className="selectable-text markdown-body w-full pl-0.5">
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

        {/* Streaming Pulse Indicator */}
        {isStreaming && isLast && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent)] align-middle animate-pulse rounded-sm" />
        )}
      </div>

      {/* Footnote: Generation Stats */}
      {message.stats && (
        <div className="mt-2.5 pt-1 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] font-mono select-none opacity-70">
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
      )}
    </div>
  );
}
