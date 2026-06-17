import { describe, it, expect } from 'vitest';
import { sanitizeShopName, capitalizeEachWord } from '@/lib/utils/input-sanitization';

describe('sanitizeShopName', () => {
  it('allows letters, numbers, spaces, and basic punctuation safe for shop names', () => {
    expect(sanitizeShopName('John\'s Shop & Cafe (No. 1)')).toBe('John\'s Shop & Cafe (No. 1)');
  });

  it('removes HTML and script tags', () => {
    expect(sanitizeShopName('<script>alert("hack")</script>Shop')).toBe('alert(hack)Shop');
  });

  it('removes disallowed characters', () => {
    expect(sanitizeShopName('Shop *^* Name!')).toBe('Shop Name');
  });
});

describe('capitalizeEachWord', () => {
  it('capitalizes the first letter of each word', () => {
    expect(capitalizeEachWord('john doe')).toBe('John Doe');
    expect(capitalizeEachWord('mcdonald')).toBe('Mcdonald');
    expect(capitalizeEachWord('shop no 5')).toBe('Shop No 5');
  });

  it('handles empty inputs and trailing spaces', () => {
    expect(capitalizeEachWord('')).toBe('');
    expect(capitalizeEachWord('john ')).toBe('John ');
  });
});
