import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

/**
 * Generate a unique 6-character alphanumeric ticket code.
 * Retries until a unique code is found in the Ticket table.
 * @param {object} tx - Prisma transaction client
 * @returns {Promise<string>} Unique ticket code
 */
export async function generateUniqueTicketCode(tx) {
  let code, exists;
  do {
    code = nanoid();
    exists = await tx.ticket.findUnique({ where: { ticketCode: code } });
  } while (exists);
  return code;
}
