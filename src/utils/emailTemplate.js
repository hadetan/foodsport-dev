// utils/emailTemplate.js
// Utility to wrap HTML content in a minimal HTML email template

/**
 * Wraps the provided HTML in a minimal HTML email template.
 * @param {string} html - The inner HTML content.
 * @param {string} subject - The email subject (used as <title>).
 * @returns {string} - The full HTML email.
 */
export function wrapHtmlEmail(html, subject) {
  const safeTitle = String(subject)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #fff; color: #222; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}
