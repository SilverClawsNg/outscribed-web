import { ref, readonly } from 'vue'

// 🔑 Single Source of Truth for the storage key
const HINT_KEY = 'X-OUTSCRIBED-WEB-TOKEN-HINT'

// Private reactive state shared across this utility module
const _isLoggedHint = ref(!!localStorage.getItem(HINT_KEY))

/**
 * 🔒 SYNCHRONOUS GUARD
 * Use this inside route guards, lifecycle hooks, or standard JS functions 
 * where you need an instantaneous, non-reactive baseline truth check.
 */
export function checkIsLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(HINT_KEY)
}

/**
 * 🔄 REACTIVE USER HINT LOOKUP
 * Use this directly inside component setups or template bindings.
 * Returns a read-only ref so components can't accidentally mutate disk state.
 */
export function useLoginHint() {
  return readonly(_isLoggedHint)
}

export function setLoginHint() {
   localStorage.setItem(HINT_KEY, 'true')
  _isLoggedHint.value = true // Sync local tab memory instantly
}

export function clearLoginHint() {
  localStorage.removeItem(HINT_KEY)
  _isLoggedHint.value = false // Sync local tab memory instantly
}


// 🌐 MULTI-TAB FIREWALL
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Sync if our specific key is mutated, or if the entire storage was cleared
    if (event.key === HINT_KEY || event.key === null) {
       _isLoggedHint.value = checkIsLoggedIn()
    }
  })
  }

/**
 * Removes localStorage entries whose keys start with
 * any of the provided prefixes (case-insensitive).
 */
export function clearByPatterns(patterns: string[]): void {
    if (!patterns?.length) return;

    try {
        const keys = Object.keys(localStorage);

        const regexes = patterns.map(
            (pattern) =>
                new RegExp(
                    `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i'
                )
        );

        let removed = 0;

        for (const key of keys) {
            if (regexes.some((regex) => regex.test(key))) {
                console.log('Removing:', key);
                localStorage.removeItem(key);
                removed++;
            }
        }

        console.log(`Removed ${removed} localStorage entries.`);
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
}