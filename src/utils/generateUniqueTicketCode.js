import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);

/**
 * Generate a unique 6-character alphanumeric ticket code.
 * Retries until a unique code is found in the Ticket table.
 * @param {object} tx - Prisma transaction client
 * @returns {Promise<string>} Unique ticket code
 */
export async function generateUniqueTicketCode(tx) {
  let code, exists;
  let attempts = 0;
  const maxAttempts = 10;
  do {
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique ticket code after maximum attempts');
    }
    code = nanoid();
    exists = await tx.ticket.findUnique({ where: { ticketCode: code } });
    attempts++;
  } while (exists);
  return code;
}
