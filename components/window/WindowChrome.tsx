"use client";

import React from "react";
import { AppToolbar } from "@/components/toolbar/AppToolbar";

interface WindowChromeProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isWindowed?: boolean;
  setIsWindowed?: (v: boolean) => void;
  onOpenModelSelector?: () => void;
}

export function WindowChrome({
  isWindowed = false,
  setIsWindowed,
  onOpenModelSelector,
}: WindowChromeProps) {
  return (
    <AppToolbar
      isWindowed={isWindowed}
      onToggleWindowed={setIsWindowed ? () => setIsWindowed(!isWindowed) : undefined}
      onOpenModelSelector={onOpenModelSelector}
    />
  );
}
