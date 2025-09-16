import React from 'react';
import DOMPurify from 'dompurify';
import '../css/ActivitySummary.css';

export default function ActivitySummary({ summary }) {
  if (!summary) return null;
  const clean = DOMPurify.sanitize(summary, { USE_PROFILES: { html: true } });

  // Some HTML serializers can produce empty <p> elements (or ones that
  // contain only whitespace). Browsers may treat those as empty and the
  // inspector will show an empty tag. To ensure the user-visible spacing
  // is preserved, convert whitespace-only paragraphs into a paragraph
  // containing a non-breaking space.
  const displayHtml = clean.replace(/<p([^>]*)>(?:\s|&nbsp;|\u00A0)*<\/p>/gi, (m, attrs) => {
    return `<p${attrs || ''}>&nbsp;</p>`;
  });

  return (
    <section className="activitySummary" style={{ width: '100%', margin: '24px 0' }}>
      <div
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    </section>
  );
}
