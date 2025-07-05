// src/utils/validation.js
// Utility: Validate required fields
function validateRequiredFields(data, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  return {
    isValid: missing.length === 0,
    missing,
    error: missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : null
  };
}

export { validateRequiredFields };
