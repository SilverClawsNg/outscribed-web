/**
 * Calculates the estimated reading time of a given rich text string.
 * Replicates the exact parsing, cleaning, and minimum threshold constraints used by the backend.
 */
export function calculateReadingTime(content: string | null | undefined): number {
  if (!content || !content.trim()) {
    return 0;
  }

  // 1. Clean the text (Strip HTML tags using a safe regex pattern)
  const plainText = content.replace(/<[^>]*>/g, '');

  // 2. Count words by splitting on any contiguous whitespace segments
  // This matches spaces, tabs, line breaks (\r, \n) and ignores empty entries naturally
  const words = plainText.trim().split(/\s+/);
  const wordCount = words[0] === '' ? 0 : words.length;

  if (wordCount === 0) return 0;

  // 3. Calculate minutes (225 Words Per Minute baseline)
  const wpm = 225;
  const minutes = Math.ceil(wordCount / wpm);

  // 4. Always return at least 1 minute for any non-empty content
  return minutes < 1 ? 1 : minutes;
}