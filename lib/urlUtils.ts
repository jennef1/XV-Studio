/**
 * URL normalization utilities for consistent business matching
 */

/**
 * Normalizes a URL for consistent comparison
 * Handles: http/https, www prefix, trailing slashes, case sensitivity
 *
 * @param url - The URL to normalize
 * @returns Normalized URL string
 *
 * @example
 * normalizeUrl("Example.com") // "https://example.com"
 * normalizeUrl("www.example.com/") // "https://example.com"
 * normalizeUrl("HTTP://Example.com") // "https://example.com"
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim().toLowerCase();

  // Add https:// if no protocol
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, '');

  // Remove www. prefix for comparison
  normalized = normalized.replace(/^(https?:\/\/)www\./, '$1');

  return normalized;
}

/**
 * Compares two URLs for equality after normalization
 *
 * @param url1 - First URL to compare
 * @param url2 - Second URL to compare
 * @returns true if URLs match after normalization
 *
 * @example
 * urlsMatch("example.com", "www.example.com/") // true
 * urlsMatch("example.com", "different.com") // false
 */
export function urlsMatch(url1: string, url2: string): boolean {
  return normalizeUrl(url1) === normalizeUrl(url2);
}
