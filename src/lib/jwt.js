import jwt from 'jsonwebtoken';

function normalizedJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  // If env contains escaped newlines, convert them to real newlines (useful when storing PEMs in .env)
  if (secret.includes('\\n')) return secret.replace(/\\n/g, '\n');
  return secret;
}

export function verifyToken(token, options) {
  const key = normalizedJwtSecret();
  return jwt.verify(token, key, options);
}

export function decodeToken(token) {
  return jwt.decode(token);
}
