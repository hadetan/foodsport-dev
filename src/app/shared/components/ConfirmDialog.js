import React, { useEffect, useRef } from 'react';
import styles from '@/app/shared/css/ConfirmDialog.module.css';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#dc2626',
  cancelColor = '#6b7280',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    function handleClick(e) {
      if (!open) return;
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} ref={dialogRef} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h3>{title}</h3>
        </div>
        <div className={styles.body} dangerouslySetInnerHTML={{ __html: message }} />
        <div className={styles.actions}>
          <button
            className={styles.cancel}
            onClick={onClose}
            style={{ backgroundColor: cancelColor }}
          >
            {cancelText}
          </button>
          <button
            className={styles.confirm}
            onClick={onConfirm}
            style={{ backgroundColor: confirmColor }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
