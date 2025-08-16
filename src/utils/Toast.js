// src/shared/components/Toast.js
"use client";
import { toast as sonnerToast } from "sonner";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

/**
 * Usage: import { toast } from "@/shared/components/Toast";
 * toast.success("Success message");
 * toast.error("Error message");
 * toast.info("Info message");
 * toast("Default message");
 */


const accentBg = '!bg-[#A6E7E1]';
const accentBorder = '!border-[#2BBFB0]';
const accentText = '!text-[#1B6E68]';
const baseClass =
  `!min-w-[340px] !max-w-[420px] !rounded-lg !shadow-lg !px-6 !py-4 !text-base !font-medium !border ${accentBorder} ${accentBg} ${accentText} flex items-center justify-center gap-3`;

const toast = Object.assign(
  (message, options = {}) =>
    sonnerToast(message, {
      ...options,
      className: baseClass,
    }),
  {
    success: (message, options = {}) =>
      sonnerToast.success(message, {
        ...options,
        className: baseClass,
        icon: <FaCheckCircle className="text-green-600 text-xl" />,
      }),
    error: (message, options = {}) =>
      sonnerToast.error(message, {
        ...options,
        className: baseClass,
        icon: <FaTimesCircle className="text-red-600 text-xl" />,
      }),
    info: (message, options = {}) =>
      sonnerToast.info(message, {
        ...options,
        className: baseClass,
        icon: <FaInfoCircle className="text-blue-600 text-xl" />,
      }),
    warning: (message, options = {}) =>
      sonnerToast.warning(message, {
        ...options,
        className: baseClass,
        icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      }),
  }
);

export { toast };
