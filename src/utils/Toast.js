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

const baseClass = [
  '!w-auto',
  '!rounded-lg',
  '!shadow-lg',
  '!px-6',
  '!py-4',
  '!text-base',
  '!font-medium',
  '!border',
  '!border-[#2BBFB0]',
  '!bg-[#D6F6F3]',
  'flex',
  'items-center',
  'gap-3',
].join(' ');

const iconClass = 'min-w-[32px] flex justify-center items-center';
const textClass = 'text-center break-words';

const toast = Object.assign(
  (message, options = {}) =>
    sonnerToast(message, {
      ...options,
      className: baseClass,
    }),
  {
    success: (message, options = {}) =>
      sonnerToast.success(
        <>
          <span className={iconClass}><FaCheckCircle className="text-green-600 text-xl" /></span>
          <span className={textClass}>{message}</span>
        </>,
        {
          ...options,
          className: `${baseClass} !text-[#1B6E68]`,
          icon: null,
        }
      ),
    error: (message, options = {}) =>
      sonnerToast.error(
        <div className="flex">
          <span className={iconClass}><FaTimesCircle className="text-red-600 text-xl" /></span>
          <span className={textClass}>{message}</span>
        </div >,
        {
          ...options,
          className: `${baseClass} !text-[#E57373]`,
          icon: null,
        }
      ),
    info: (message, options = {}) =>
      sonnerToast.info(
        <>
          <span className={iconClass}><FaInfoCircle className="text-blue-600 text-xl" /></span>
          <span className={textClass}>{message}</span>
        </>,
        {
          ...options,
          className: `${baseClass} !text-[#1B6E68]`,
          icon: null,
        }
      ),
    warning: (message, options = {}) =>
      sonnerToast.warning(
        <>
          <span className={iconClass}><FaExclamationTriangle className="text-yellow-500 text-xl" /></span>
          <span className={textClass}>{message}</span>
        </>,
        {
          ...options,
          className: `${baseClass} !text-yellow-700`,
          icon: null,
        }
      ),
  }
);

export { toast };
