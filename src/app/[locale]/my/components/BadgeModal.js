'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '@/app/[locale]/my/css/BadgeModal.css';

function resolveLocalizedFields(badge, locale) {
  const isZh = locale?.toLowerCase().startsWith('zh');
  return {
    title: isZh && badge.titleZh ? badge.titleZh : badge.title,
    description: isZh && badge.descriptionZh ? badge.descriptionZh : badge.description,
  };
}

export default function BadgeModal({ badge, locale, labels, onClose }) {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!badge) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [badge, onClose]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(''), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const localized = useMemo(() => {
    if (!badge) return { title: '', description: '' };
    return resolveLocalizedFields(badge, locale);
  }, [badge, locale]);

  if (!badge) return null;

  const sharePath = `/badges/${badge.id}`;
  const shareUrl = typeof window !== 'undefined'
    ? new URL(sharePath, window.location.origin).toString()
    : sharePath;

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: localized.title, text: localized.description, url: shareUrl });
        setFeedback(labels?.shareSuccess || 'Shared successfully.');
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback(labels?.shareSuccess || 'Badge link copied.');
        return;
      }

      window.open(shareUrl, '_blank', 'noopener');
    } catch (error) {
      setFeedback(labels?.shareError || 'Unable to share badge right now.');
    }
  };

  return (
    <div className="badge-modal" role="dialog" aria-modal="true" aria-label={localized.title}>
      <div className="badge-modal__backdrop" onClick={onClose} />
      <div className="badge-modal__content">
        <button type="button" className="badge-modal__close" onClick={onClose} aria-label={labels?.close || 'Close'}>
          ×
        </button>
        <div className="badge-modal__body">
          <div className="badge-modal__image" aria-hidden="true">
            {badge.imageUrl ? (
              <img src={badge.imageUrl} alt="" />
            ) : (
              <span role="img" aria-label={localized.title}>
                {badge.emoji || '🏅'}
              </span>
            )}
          </div>
          <h2 className="badge-modal__title">{localized.title}</h2>
          <p className="badge-modal__description">{localized.description}</p>
        </div>
        <div className="badge-modal__footer">
          <button type="button" className="badge-modal__share" onClick={handleShare}>
            {labels?.share || 'Share badge'}
          </button>
          <a className="badge-modal__link" href={sharePath} target="_blank" rel="noreferrer">
            {labels?.viewDetails || 'View details'}
          </a>
        </div>
        {feedback && <p className="badge-modal__feedback">{feedback}</p>}
      </div>
    </div>
  );
}
