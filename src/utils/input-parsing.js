/**
 * Shared input parsing utilities for consistent handling of request payload values.
 */

/**
 * Parses a date value and returns a Date object or null.
 * @param {*} value - The value to parse as a date.
 * @param {Object} options - Options for parsing.
 * @param {boolean} options.preserveUndefined - If true, returns undefined for undefined input.
 * @returns {Date|null|undefined} Parsed Date, null for invalid/empty values, or undefined if preserveUndefined is set.
 */
export function parseDate(value, { preserveUndefined = false } = {}) {
  if (value === undefined && preserveUndefined) {
    return undefined;
  }
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Parses a boolean input value from various types (string, number, boolean).
 * Returns undefined for empty/null values, allowing calling code to apply defaults.
 * @param {*} value - The value to parse as a boolean.
 * @returns {boolean|undefined} Parsed boolean, or undefined if the value is empty/unrecognized.
 */
export function parseBooleanInput(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }
  return Boolean(value);
}

/**
 * Parses an integer input value. Returns undefined for undefined input,
 * null for empty/invalid values, or the truncated integer.
 * @param {*} value - The value to parse as an integer.
 * @returns {number|null|undefined} Parsed integer, null for empty/invalid, or undefined if input is undefined.
 */
export function parseIntegerInput(value) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.trunc(numeric);
}

/**
 * Normalizes a nullable string value. Returns null for undefined, null, or empty strings.
 * @param {*} value - The value to normalize.
 * @returns {string|null} Trimmed string or null if empty/invalid.
 */
export function normalizeNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed || null;
}
