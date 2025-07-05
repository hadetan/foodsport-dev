// src/utils/sanitize.js
// Utility: Sanitize data for DB insertion
function sanitizeData(data, allowedFields) {
  const sanitized = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }
  return sanitized;
}

export { sanitizeData };
