
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useTagFilterStore = defineStore('tagFilter', () => {

 // --- 1. STATE DEFINITIONS ---
  
  const pointer = ref<string | null>('1')

  // --- 3. HELPER UTILITIES ---
  // Pure parsing helper: returns null if missing, empty, or placeholder
  function parseString(value: any): string | null {
    if (value === undefined || value === null || value === '') {
      return null
    }
    return String(value).trim()
  }

   function parseBoolean(value: any): string | null {
    if (value !== 'true' && value !== 'false') {
      return null
    }
    return String(value).trim()
  }

  // --- 2. RESET STATE PASS ---
  function reset() {
   
    pointer.value = '1'
  }

  // 3. Build API url string
  function buildApiPath(baseRoute: string, overridePointer?: string | null, anchor?: string | null): string {
    const urlParams = new URLSearchParams();

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
    urlParams.append('pointer', currentPointer);

  if (anchor) {
    urlParams.append('anchor', anchor);
  }

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    pointer,
    reset, buildApiPath
  };
});