import React from 'react';
import DOMPurify from 'dompurify';
import '../css/ActivitySummary.css';

export default function ActivitySummary({ summary }) {
  if (!summary) return null;
  const clean = DOMPurify.sanitize(summary, { USE_PROFILES: { html: true } });

  return (
    <section className="activitySummary" style={{ width: '100%', margin: '24px 0' }}>
      <div
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </section>
  );
}
