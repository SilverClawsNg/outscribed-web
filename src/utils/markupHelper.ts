import DOMPurify from 'dompurify';

export function sanitizeHtml(value: string | null | undefined): string {
  if (!value) return '';

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 'a',
      'h1', 'h2', 'blockquote', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'img', 'embed', 'object'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    ADD_ATTR: ['target', 'rel'],
  });
}