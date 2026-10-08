/**
 * Robust Phone & WhatsApp Normalization Utility
 * Ensures WhatsApp links always open the exact client chat without errors.
 */

/**
 * Normalizes any raw phone number into an international E.164 digit string without '+' or leading '0'.
 * Example:
 *  - "+91 98230 12345" -> "919823012345"
 *  - "098230 12345" -> "919823012345"
 *  - "9823012345" -> "919823012345"
 *  - "0712 254 3322" -> "917122543322"
 *  - "+1 (555) 234-5678" -> "15552345678"
 *  - "" or null -> ""
 */
export function normalizeWhatsAppNumber(
  rawPhone: string | null | undefined,
  defaultCountryCode = '91'
): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';

  // 1. Remove all non-numeric characters except leading '+'
  let trimmed = rawPhone.trim();

  // If starts with 00 (international prefix), strip it
  if (trimmed.startsWith('00')) {
    trimmed = trimmed.slice(2);
  }

  // Remove any remaining '+' and all non-digits
  let digits = trimmed.replace(/[^0-9]/g, '');

  if (!digits) return '';

  // Edge case: if starts with default country code + trunk 0 (e.g. +91 09823012345 -> 9109823012345)
  if (digits.startsWith(`${defaultCountryCode}0`)) {
    digits = defaultCountryCode + digits.slice(defaultCountryCode.length).replace(/^0+/, '');
  }

  // If starts with single leading 0 (domestic trunk prefix, e.g. 09823012345 or 07122543322)
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  // If already starts with the default country code (e.g. 91) and has 12 digits, it is already valid
  if (digits.startsWith(defaultCountryCode) && digits.length >= 12) {
    return digits;
  }

  // If it's a 10-digit number (standard mobile or landline without country code)
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  // If it's 11 or 12 digits and already has a country code, return as is
  if (digits.length >= 11) {
    return digits;
  }

  // If less than 10 digits, it's incomplete
  return '';
}

/**
 * Builds a clean, fully-formed WhatsApp URL.
 * Returns null if the number is invalid or empty to prevent launching broken links.
 */
export function buildWhatsAppUrl(
  rawPhone: string | null | undefined,
  textMessage: string,
  defaultCountryCode = '91'
): string | null {
  const normalized = normalizeWhatsAppNumber(rawPhone, defaultCountryCode);
  if (!normalized || normalized.length < 10) {
    return null;
  }

  const encoded = encodeURIComponent(textMessage.trim());
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Formats a phone number for user display (e.g. "+91 98230 12345")
 */
export function formatDisplayPhone(rawPhone: string | null | undefined): string {
  if (!rawPhone) return '';
  const digits = normalizeWhatsAppNumber(rawPhone);
  if (!digits) return rawPhone.trim();

  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  return rawPhone.trim();
}
