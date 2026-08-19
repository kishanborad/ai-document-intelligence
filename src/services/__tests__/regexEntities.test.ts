import { describe, it, expect } from 'vitest';
import { extractRegexEntities } from '../regexEntities';

const ALL_TYPES = new Set(['Person', 'Organization', 'Location', 'Date', 'Email', 'Phone', 'Money', 'URL', 'Invoice#']);

describe('extractRegexEntities', () => {
  it('extracts emails', () => {
    const text = 'Contact us at hello@example.com for info';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const emails = entities.filter((e) => e.type === 'Email');
    expect(emails).toHaveLength(1);
    expect(emails[0].text).toBe('hello@example.com');
    expect(emails[0].source).toBe('regex');
    expect(emails[0].confidence).toBe(1.0);
  });

  it('extracts phone numbers', () => {
    const text = 'Call 555-123-4567 or (555) 987-6543';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const phones = entities.filter((e) => e.type === 'Phone');
    expect(phones.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts URLs', () => {
    const text = 'Visit https://example.com/page for details';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const urls = entities.filter((e) => e.type === 'URL');
    expect(urls).toHaveLength(1);
    expect(urls[0].text).toBe('https://example.com/page');
  });

  it('extracts dates', () => {
    const text = 'Due date: January 15, 2025 and 2024-01-15';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const dates = entities.filter((e) => e.type === 'Date');
    expect(dates.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts money amounts', () => {
    const text = 'Total: $1,234.56 or 500 EUR';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const money = entities.filter((e) => e.type === 'Money');
    expect(money.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts invoice numbers', () => {
    const text = 'Reference: INV-12345 and Invoice #67890';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const invoices = entities.filter((e) => e.type === 'Invoice#');
    expect(invoices.length).toBeGreaterThanOrEqual(1);
  });

  it('respects disabled types', () => {
    const text = 'Email: test@test.com Phone: 555-123-4567';
    const enabled = new Set(['Email']); // Phone disabled
    const entities = extractRegexEntities(text, enabled, []);
    expect(entities.every((e) => e.type === 'Email')).toBe(true);
  });

  it('handles custom patterns', () => {
    const text = 'Order ORD-999 confirmed';
    const custom = [{ id: '1', label: 'OrderID', pattern: 'ORD-\\d+' }];
    const entities = extractRegexEntities(text, ALL_TYPES, custom);
    const orders = entities.filter((e) => e.type === 'OrderID');
    expect(orders).toHaveLength(1);
    expect(orders[0].text).toBe('ORD-999');
  });

  it('skips invalid custom regex', () => {
    const custom = [{ id: '1', label: 'Bad', pattern: '[invalid' }];
    const entities = extractRegexEntities('test', ALL_TYPES, custom);
    expect(entities.filter((e) => e.type === 'Bad')).toHaveLength(0);
  });

  it('has correct start/end positions', () => {
    const text = 'Email: hello@world.com done';
    const entities = extractRegexEntities(text, ALL_TYPES, []);
    const email = entities.find((e) => e.type === 'Email')!;
    expect(text.slice(email.start, email.end)).toBe('hello@world.com');
  });
});
