import { randomInt } from 'crypto';

/**
 * Generate a cryptographically secure numeric OTP
 * @param {number} digits
 * @returns {string}
 */
export function generateOtp(digits = 6) {
  const max = 10 ** digits;
  const n = randomInt(0, max);
  return String(n).padStart(digits, '0');
}
