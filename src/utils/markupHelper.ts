import DOMPurify from 'dompurify';

/**
 * Sanitizes raw HTML strings to eliminate XSS vectors before rendering.
 * Vue equivalent to Blazor's MarkupString.Sanitize() extension pipeline.
 */
export function sanitizeHtml(value: string | null | undefined): string {
  if (!value) return '';
  
  // Clean the markup string using DOMPurify's default secure ruleset
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'i', 'a',
      'h1', 'blockquote', 'span'
    ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      ADD_ATTR: ['target', 'rel'], // Force safe link behavior
  });
}