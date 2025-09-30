"use client";

import { toast as sonnerToast } from "sonner";

export type ToastVariant = "default" | "destructive";

export type ToastPayload = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

// Re-export a compatible toast function backed by Sonner
export const toast = (payload: ToastPayload) => {
  const { title, description, variant, duration } = payload;
  // Map variant to Sonner color
  const type = variant === "destructive" ? "error" : "default";
  // Sonner supports string or ReactNode; we combine title/description
  if (title && description) {
    return sonnerToast[ type === "error" ? "error" : "message" ](
      title,
      { description, duration }
    );
  }
  if (title) {
    return sonnerToast[ type === "error" ? "error" : "message" ](title, { duration });
  }
  if (description) {
    return sonnerToast[ type === "error" ? "error" : "message" ](description, { duration });
  }
  return sonnerToast("", { duration });
};

export function useToast() {
  return { toast };
}
