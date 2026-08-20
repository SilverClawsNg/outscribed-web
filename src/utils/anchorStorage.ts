// utils/anchorStorage.ts

export const EngagementTypes = ['saves', 'flags', 'shares', 'votes', 'upvotes'] as const;
export type RelationType = (typeof EngagementTypes)[number];
export type TypeLabel = 'tale' | 'insight' | 'comment';

/**
 * Generates key in format: `${typeLabel}:anchor:${type}`
 */
export function getAnchorKey(typeLabel: TypeLabel, type: string): string {
  return `${typeLabel}:anchor:${type.toLowerCase()}`;
}

export function getStoredAnchor(typeLabel: TypeLabel, type: string): string | null {
  if (!type || !EngagementTypes.includes(type.toLowerCase() as RelationType)) return null;
  return localStorage.getItem(getAnchorKey(typeLabel, type));
}

export function setStoredAnchor(typeLabel: TypeLabel, type: string, anchorValue: string): void {
  if (!type || !anchorValue || !EngagementTypes.includes(type.toLowerCase() as RelationType)) return;
  localStorage.setItem(getAnchorKey(typeLabel, type), anchorValue);
}

export function clearStoredAnchor(typeLabel: TypeLabel, type: string): void {
  localStorage.removeItem(getAnchorKey(typeLabel, type));
}