// Input sanitization and validation utilities

// Remove potentially dangerous characters and limit length
export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Escape HTML entities to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Sanitize but preserve some characters for display (less strict)
export function sanitizeDisplayString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// Validate and sanitize URL
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') return '';

  const trimmed = input.trim().slice(0, 500);

  // Only allow http and https protocols
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

// Validate username (alphanumeric, underscore only)
export function sanitizeUsername(input: unknown, maxLength: number = 50): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[^a-zA-Z0-9_]/g, '');
}

// Validate array of strings against allowed values
export function validateArrayValues(input: unknown, allowedValues: readonly string[]): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item): item is string => typeof item === 'string')
    .filter(item => allowedValues.includes(item))
    .slice(0, 10); // Max 10 items
}

// Validate single value against allowed values
export function validateAllowedValue(input: unknown, allowedValues: readonly string[]): string {
  if (typeof input !== 'string') return '';
  return allowedValues.includes(input) ? input : '';
}

// Rate limiting store (in-memory, resets on deploy)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);
