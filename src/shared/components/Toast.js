// src/shared/components/Toast.js
"use client";
import { toast as sonnerToast } from "sonner";

/**
 * Usage: import { toast } from "@/shared/components/Toast";
 * toast.success("Success message");
 * toast.error("Error message");
 * toast.info("Info message");
 * toast("Default message");
 */

const toast = Object.assign(
  (message, options = {}) => sonnerToast(message, options),
  {
    success: (message, options = {}) =>
      sonnerToast.success(message, {
        ...options,
        className: "bg-green-600 text-white",
        icon: "✅",
      }),
    error: (message, options = {}) =>
      sonnerToast.error(message, {
        ...options,
        className: "bg-red-600 text-white",
        icon: "❌",
      }),
    info: (message, options = {}) =>
      sonnerToast.info(message, {
        ...options,
        className: "bg-blue-600 text-white",
        icon: "ℹ️",
      }),
    warning: (message, options = {}) =>
      sonnerToast.warning(message, {
        ...options,
        className: "bg-yellow-500 text-black",
        icon: "⚠️",
      }),
  }
);

export { toast };
