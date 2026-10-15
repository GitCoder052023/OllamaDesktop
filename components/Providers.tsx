"use client";

import React from "react";
import { ChatProvider } from "@/context/ChatContext";
import { ToastContainer } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      {children}
      <ToastContainer />
    </ChatProvider>
  );
}
