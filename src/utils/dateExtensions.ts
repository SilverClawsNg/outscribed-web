// src/utils/dateExtensions.ts

/**
 * Normalizes input safely into a native JavaScript Date object.
 * Handles ISO strings, timestamps, or pre-instantiated Date objects.
 */
function ensureDate(input: string | Date | number): Date {
  return input instanceof Date ? input : new Date(input)
}

// (1) MMMM dd, yyyy -> "June 10, 2026"
export function toShortDate(dateIn: string | Date): string {
  const date = ensureDate(dateIn)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  })
}

// (2) h:mmtt, MMMM dd, yyyy -> "2:44 PM, June 10, 2026"
export function toLongDate(dateIn: string | Date): string {
  const date = ensureDate(dateIn)
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase() // matches your .NET lowercase 'am/pm' pattern

  const dateStr = toShortDate(date)
  return `${timeStr}, ${dateStr}`
}

// (3) MMMM dd, yyyy at hh:mm tt -> "June 10, 2026 at 02:44 PM"
export function toTimelineDate(dateIn: string | Date): string {
  const date = ensureDate(dateIn)
  const dateStr = toShortDate(date)
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  return `${dateStr} at ${timeStr}`
}

// (4) Relative Human Readable Compact format -> "5s", "12m", "2h", "3d"
export function toRelativeTime(dateIn: string | Date): string {
  const date = ensureDate(dateIn)
  const delta = Math.floor((Date.now() - date.getTime()) / 1000)

  // 🌟 Handle clock drift / instant creation safely
  if (delta <= 0) return 'Now'
  if (delta < 60) return `${delta}s`

  const minutes = Math.floor(delta / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 360) return `${days}d`

  const years = Math.floor(days / 365)
  return `${Math.max(1, years)}y`
}