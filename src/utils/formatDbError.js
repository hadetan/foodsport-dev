// src/utils/formatDbError.js
// Utility: Format Prisma DB error for API response
function formatDbError(error) {
  if (!error) return null;
  if (error.code === 'P2002') {
    return {
      code: 'DUPLICATE_ENTRY',
      message: 'A record with this information already exists',
      details: error.meta
    };
  }
  if (error.code === 'P2003') {
    return {
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'Referenced record does not exist',
      details: error.meta
    };
  }
  if (error.code === 'P2004') {
    return {
      code: 'NOT_NULL_VIOLATION',
      message: 'Required field is missing',
      details: error.meta
    };
  }
  return {
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
    details: error.message
  };
}

export { formatDbError };
