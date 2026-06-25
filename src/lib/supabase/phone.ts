const KEEN_PREFIX = /^0(\d{9})$/;

export function normalizeToE164(phone: string): string {
  const digits = phone.replace(/\s+/g, "");
  if (digits.startsWith("+254") && digits.length === 13) return digits;
  if (digits.startsWith("254") && digits.length === 12) return `+${digits}`;
  if (KEEN_PREFIX.test(digits)) return `+254${digits.slice(1)}`;
  throw new Error(`Cannot normalize phone number: ${phone}`);
}
