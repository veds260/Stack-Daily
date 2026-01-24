import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Get encryption key from environment or generate a warning
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('ENCRYPTION_KEY not set - using fallback (not secure for production)');
    // Fallback for development - in production, ENCRYPTION_KEY must be set
    return scryptSync('fallback-dev-key-not-secure', 'salt', 32);
  }

  // Derive a proper 32-byte key from the provided key
  return scryptSync(key, 'stack-daily-salt', 32);
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns base64 encoded string: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) return '';

  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine iv:authTag:encrypted as base64
    return Buffer.from(
      `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    ).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

/**
 * Decrypt data encrypted with the encrypt function
 */
export function decrypt(encryptedBase64: string): string {
  if (!encryptedBase64) return '';

  try {
    const key = getEncryptionKey();
    const decoded = Buffer.from(encryptedBase64, 'base64').toString('utf8');
    const [ivHex, authTagHex, encryptedHex] = decoded.split(':');

    if (!ivHex || !authTagHex || !encryptedHex) {
      return encryptedBase64; // Return as-is if not in expected format (legacy data)
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedBase64; // Return original if decryption fails (legacy data)
  }
}

/**
 * Hash sensitive data (one-way, for lookups)
 * Use this when you don't need to retrieve the original value
 */
export function hashData(text: string): string {
  if (!text) return '';

  const key = getEncryptionKey();
  const hash = scryptSync(text, key, 32);
  return hash.toString('hex');
}
