const MAX_TITLE_SLUG_LENGTH = 128;
const FALLBACK_TITLE_SLUG = 'story';

/**
 * Isolates and generates a safe, canonical kebab-case slug for just the title segment.
 * Matches the exact character normalization, clipping, and fallback specifications used by the backend.
 */
export function generateTitleSlug(title: string | null | undefined): string {
  if (!title || !title.trim()) {
    return FALLBACK_TITLE_SLUG;
  }

  // Decompose accents/diacritics into separate characters (FormD equivalent)
  const normalizedString = title.normalize('NFD');
  const slugArray: string[] = [];

  // 🎯 Type-Safe Iteration: Guarantees 'char' is always a defined 'string' primitive
  for (const char of normalizedString) {
    // Check for alphanumeric ranges (ASCII)
    if (
      (char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      (char >= '0' && char <= '9')
    ) {
      slugArray.push(char.toLowerCase());
    } 
    // Match spaces, dashes, underscores, and forward slashes
    else if (
      char === ' ' || 
      char === '-' || 
      char === '_' || 
      char === '/' ||
      /\s/.test(char)
    ) {
      if (slugArray.length > 0 && slugArray[slugArray.length - 1] !== '-') {
        slugArray.push('-');
      }
    }
  }

  // Assemble and strip hanging leading/trailing hyphens
  let titleSlug = slugArray.join('').replace(/^-+|-+$/g, '');

  // Collapse consecutive hyphens
  titleSlug = titleSlug.replace(/-+/g, '-');

  // Safe Clipping Guard
  if (titleSlug.length > MAX_TITLE_SLUG_LENGTH) {
    titleSlug = titleSlug.substring(0, MAX_TITLE_SLUG_LENGTH).replace(/-+$/, '');
  }

  // Deep Defense Fallback
  if (!titleSlug || !titleSlug.trim()) {
    titleSlug = FALLBACK_TITLE_SLUG;
  }

  return titleSlug;
}