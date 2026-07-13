
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValidFaqCategory} from '@/utils/validators'; 

export const useFaqListFilterStore = defineStore('faqListFilter', () => {
  
// State

const category = ref<string>('General')

  const keyword = ref<string | null>(null);
  
   // --- 3. HELPER UTILITIES ---
  // Pure parsing helper: returns null if missing, empty, or placeholder
  function parseValue(value: any): string | null {
    if (value === undefined || value === null || value === '') {
      return null
    }
    return String(value).trim()
  }

  function reset() {
    category.value = 'General'
    keyword.value = null;
  }

  // 1. Rehydrate from URL parameters object
function rehydrate(queryParameters: Record<string, any>): { isClean: boolean }{
   
    reset(); // Evict current filters to cleanly build the fresh reality

    let wasClean = true

    if (queryParameters && Object.keys(queryParameters).length > 0) {

if(queryParameters.category){
     // 🎯 Parse & Validate Sort
    const validatedFaqCategory = getValidFaqCategory(queryParameters.category)
    category.value = validatedFaqCategory || 'General'
      if(!validatedFaqCategory) wasClean = false

}

if(queryParameters.keyword){
   // 🎯 Parse & Validate Activity
  keyword.value = parseValue(queryParameters.keyword)
}


    }

    return { isClean: wasClean }
}

  
function getAsDictionary(): Record<string, string> {
  
  // 1. Collect all raw state values into a temporary workspace object
  const rawValues: Record<string, any> = {
      category: category.value,
      keyword: keyword.value,
     
  }

  // 2. Create a clean payload container
  const cleanQuery: Record<string, string> = {}

  // 3. Loop through the properties and only include valid, active filters
  Object.keys(rawValues).forEach((key) => {
    const val = rawValues[key]
    
    // Skip true nulls, undefined, or empty arrays/spaces
    if (val === undefined || val === null) return
    
    const stringified = String(val).trim()
    
    // 🛡️ Skip empty strings, dropdown placeholders, and accidental leakage strings
    if (
      stringified === '' || 
      stringified === '-1' || 
      stringified === 'null' || 
      stringified === 'undefined'
    ) {
      return
    }

    // 🌟 If it passes all checks, include it in lowercase format!
    cleanQuery[key] = stringified.toLowerCase()
  })

  // 4. Return an object that ONLY has the exact keys we want visible in the URL
  return cleanQuery
}

  // 3. Build API url string
  function buildApiPath(baseRoute: string): string {
    
    const urlParams = new URLSearchParams();

    if (category.value && category.value !== '-1') 
      urlParams.append('category', category.value);

    if (keyword.value && keyword.value.trim() !== '') 
      urlParams.append('keyword', keyword.value);

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    category, keyword,
    reset, rehydrate, getAsDictionary, buildApiPath
  };
});