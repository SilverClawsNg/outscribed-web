import type{ Country, Category, SortType, ContentType, TaleStatus, ActivityType, GeneralSortType,
  ReactionType, CommentStatus, FlagType, LimitedContentType
 } from '@/utils/enumHelper'
import { CountryDescriptions,  CategoryDescriptions, SortTypeDescriptions, ContentTypeDescriptions,
  TaleStatusDescriptions, ActivityTypeDescriptions, GeneralSortTypeDescriptions, ReactionTypeDescriptions,
  CommentStatusDescriptions, FlagTypeDescriptions,
  LimitedContentTypeDescriptions
 } from '@/utils/descriptors'

/**
 * 🛡️ Type Guard: Validates if a raw string is a valid code
 *    Check if the string exists as a key in your Descriptions dictionary
 */

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidContentType(code: string | null | undefined): ContentType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(ContentTypeDescriptions) as ContentType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidLimitedContentType(code: string | null | undefined): LimitedContentType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(LimitedContentTypeDescriptions) as LimitedContentType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}


// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidActivityType(code: string | null | undefined): ActivityType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(ActivityTypeDescriptions) as ActivityType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidTaleStatus(code: string | null | undefined): TaleStatus | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(TaleStatusDescriptions) as TaleStatus[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidCommentStatus(code: string | null | undefined): CommentStatus | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(CommentStatusDescriptions) as CommentStatus[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidSortType(code: string | null | undefined): SortType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(SortTypeDescriptions) as SortType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}


// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidGeneralSortType(code: string | null | undefined): GeneralSortType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(GeneralSortTypeDescriptions) as GeneralSortType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidCategory(code: string | null | undefined): Category | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(CategoryDescriptions) as Category[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidCountry(code: string | null | undefined): Country | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(CountryDescriptions) as Country[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidReactionType(code: string | null | undefined): ReactionType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(ReactionTypeDescriptions) as ReactionType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}


// 🌟 FIX: Find the correct PascalCase value case-insensitively
export function getValidFlagType(code: string | null | undefined): FlagType | null {
  if (!code || code === '-1') return null

  const keys = Object.keys(FlagTypeDescriptions) as FlagType[]
  
  // Look for the element where the lowercase strings align perfectly
  const matchedKey = keys.find(key => key.toLowerCase() === code.toLowerCase())
  
  // Returns 'Account' (PascalCase) even if the browser sent 'account' (lowercase)
  return matchedKey || null
}

/**
 * Validates an email address against standard formatting rules.
 * Uses a safe regex pattern that prevents catastrophic backtracking performance issues.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  // Standard email validation pattern (RFC 5322 compliant surface check)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Basic security and sanitation cleanup
  const sanitized = email.trim();
  
  if (sanitized.length > 254) return false; // RFC maximum length boundary
  
  return emailRegex.test(sanitized);
}