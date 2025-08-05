import React, { useEffect, useRef, useState } from 'react';
import styles from '@/app/shared/css/ShareDialog.module.css';

export default function ShareDialog({ url, onClose }) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    function handleClick(e) {
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
  }, [onClose]);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} ref={dialogRef}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">×</button>
        <div className={styles.label}>Share this activity</div>
        <div className={styles.inputRow}>
          <div className={styles.fakeInput} title={url}>
            {url}
            <button
              className={styles.copyBtn}
              onClick={handleCopy}
              tabIndex={0}
              aria-label="Copy link"
              type="button"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
