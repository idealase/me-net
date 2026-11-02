/**
 * HTML escaping helpers for building markup from template strings.
 *
 * Any user-controlled text (labels, notes, IDs from imported files, warning
 * messages that embed labels) must go through escapeHtml before it is
 * interpolated into innerHTML, including inside attribute values.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a string for safe use in HTML text content and quoted attribute values.
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}
