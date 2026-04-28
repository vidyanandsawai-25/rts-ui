/**
 * Parses a value into a boolean, accepting true/false, 'true'/'false', 1/0, and defaulting to false otherwise.
 */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (lower === '1') return true;
    if (lower === '0') return false;
  }
  if (typeof value === 'number') return value === 1;
  return false;
}