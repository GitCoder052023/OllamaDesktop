"use client";

import React from "react";

interface OllamaLogoProps {
  className?: string;
  size?: number;
}

export function OllamaLogo({ className = "w-4 h-4", size }: OllamaLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4C10.8954 4 10 4.89543 10 6V9.17157C9.3907 9.56064 9 10.233 9 11V12.1716C8.3907 12.5606 8 13.233 8 14V16C8 17.1046 8.89543 18 10 18H11V22C11 23.6569 12.3431 25 14 25H15V26.5C15 27.3284 15.6716 28 16.5 28C17.3284 28 18 27.3284 18 26.5V25H20V26.5C20 27.3284 20.6716 28 21.5 28C22.3284 28 23 27.3284 23 26.5V25H23.5C25.433 25 27 23.433 27 21.5V17C27 15.3431 25.6569 14 24 14H19V8C19 6.89543 18.1046 6 17 6H16V4C16 2.89543 15.1046 2 14 2H12C10.8954 2 10 2.89543 10 4H12ZM13 13.5C13 14.3284 12.3284 15 11.5 15C10.6716 15 10 14.3284 10 13.5C10 12.6716 10.6716 12 11.5 12C12.3284 12 13 12.6716 13 13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface OllamaDesktopBrandProps {
  className?: string;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

export function OllamaDesktopBrand({
  className = "",
  showBadge = false,
  size = "md",
}: OllamaDesktopBrandProps) {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-[12px]",
    md: "text-[13px]",
    lg: "text-[19px]",
  };

  const squircleSizes = {
    sm: "w-5 h-5 rounded-[5px]",
    md: "w-6 h-6 rounded-[7px]",
    lg: "w-10 h-10 rounded-[12px]",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div
        className={`${squircleSizes[size]} bg-gradient-to-br from-[var(--surface-active)] to-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-xs shrink-0`}
      >
        <OllamaLogo className={iconSizes[size]} />
      </div>
      <div className="flex items-center gap-1.5 leading-none">
        <span className={`font-semibold tracking-tight text-[var(--text-primary)] ${textSizes[size]}`}>
          Ollama<span className="text-[var(--accent)]">Desktop</span>
        </span>
        {showBadge && (
          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-active)] text-[var(--text-tertiary)] border border-[var(--border-subtle)] font-medium leading-none">
            macOS
          </span>
        )}
      </div>
    </div>
  );
}
