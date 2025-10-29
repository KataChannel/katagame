// Generate JWT token for testplayer
const crypto = require('crypto');

// JWT Secret from .env or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';

// Create JWT header
const header = {
  alg: 'HS256',
  typ: 'JWT',
};

// Create JWT payload
const payload = {
  playerId: 'a0000000-0000-0000-0000-000000000001',
  username: 'testplayer',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
};

// Base64URL encode
function base64UrlEncode(str) {
  return Buffer.from(JSON.stringify(str))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Create signature
const encodedHeader = base64UrlEncode(header);
const encodedPayload = base64UrlEncode(payload);
const signatureInput = `${encodedHeader}.${encodedPayload}`;

const signature = crypto
  .createHmac('sha256', JWT_SECRET)
  .update(signatureInput)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = `${encodedHeader}.${encodedPayload}.${signature}`;

console.log('==================================');
console.log('TEST PLAYER TOKEN');
console.log('==================================');
console.log('Username:', payload.username);
console.log('Player ID:', payload.playerId);
console.log('Expires:', new Date(payload.exp * 1000).toISOString());
console.log('\nJWT Token:');
console.log(token);
console.log('\nUse in API requests:');
console.log(`Authorization: Bearer ${token}`);
console.log('==================================');
