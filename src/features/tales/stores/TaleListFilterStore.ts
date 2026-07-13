
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  getValidCountry, getValidCategory, getValidSortType, getValidVoteType
} from '@/utils/validators'; 

export const useTaleListFilterStore = defineStore('taleListFilter', () => {
  
// State
  const username = ref<string | null>(null);

const country = ref<string | null>(null)
const category = ref<string | null>(null)
const votetype = ref<string | null>(null)

  const tag = ref<string | null>(null);
  const keyword = ref<string | null>(null);
  const sort = ref<string | null>(null)

  const pointer = ref<string | null>('1');

   // --- 3. HELPER UTILITIES ---
  // Pure parsing helper: returns null if missing, empty, or placeholder
  function parseValue(value: any): string | null {
    if (value === undefined || value === null || value === '') {
      return null
    }
    return String(value).trim()
  }

  function reset() {
    sort.value = '-1'
    country.value = '-1'
    category.value = '-1'
    votetype.value = '-1'

    keyword.value = '';
    username.value = '';
    tag.value = '';
    pointer.value = '1';
  }

  // 1. Rehydrate from URL parameters object
function rehydrate(queryParameters: Record<string, any>): { isClean: boolean }{
   
    reset(); // Evict current filters to cleanly build the fresh reality

    let wasClean = true

    if (queryParameters && Object.keys(queryParameters).length > 0) {

if(queryParameters.username){
   // 🎯 Parse & Validate Activity
  username.value = parseValue(queryParameters.username)
    console.log('hydrating username: ${`queryParameters.username`}');

}

if(queryParameters.country){
     // 🎯 Parse & Validate Sort
    const validatedCountry = getValidCountry(queryParameters.country)
    country.value = validatedCountry || null
      if(!validatedCountry) wasClean = false

}

if(queryParameters.category){
     // 🎯 Parse & Validate Content (Accepts lowercase from URL, stores PascalCase)
    const validatedCategory = getValidCategory(queryParameters.category)
    category.value = validatedCategory || null
    if(!validatedCategory) wasClean = false
  
}

if(queryParameters.votetype){
   // 🎯 Parse & Validate Activity
    const validatedVote = getValidVoteType(queryParameters.votetype)
    votetype.value = validatedVote || null
    if(!validatedVote) wasClean = false
}

if(queryParameters.tag){
   tag.value = parseValue(queryParameters.tag)
}
  

if(queryParameters.keyword){
   // 🎯 Parse & Validate Activity
  keyword.value = parseValue(queryParameters.keyword)
}

if(queryParameters.sort){
 // 🎯 Parse & Validate Sort
  const validatedSort = getValidSortType(queryParameters.sort)
  sort.value = validatedSort || null
  if(!validatedSort) wasClean = false
}


    }

    return { isClean: wasClean }
}

  
function getAsDictionary(): Record<string, string> {
  
  // 1. Collect all raw state values into a temporary workspace object
  const rawValues: Record<string, any> = {
    username: username.value,
      country: country.value,
      category: category.value,
      votetype: votetype.value,
      keyword: keyword.value,
      tag: tag.value,
      sort: sort.value,
      pointer: '1'
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
  function buildApiPath(baseRoute: string, overridePointer?: string | null, anchor?: string | null): string {
    const urlParams = new URLSearchParams();

    if (sort.value && sort.value !== '-1') 
      urlParams.append('sort', sort.value);

    if (country.value && sort.value !== '-1') 
      urlParams.append('country', country.value);

    if (category.value && sort.value !== '-1') 
      urlParams.append('category', category.value);

    if (votetype.value && sort.value !== '-1') 
      urlParams.append('votetype', votetype.value);

    if (keyword.value && keyword.value.trim() !== '') 
      urlParams.append('keyword', keyword.value);

    if (username.value && username.value.trim() !== '') 
      urlParams.append('username', username.value);

    if (tag.value && tag.value.trim() !== '') 
      urlParams.append('tag', tag.value);

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
      urlParams.append('pointer', currentPointer);

        if (anchor) 
      urlParams.append('anchor', anchor);

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    sort, country, category, votetype, username, tag, keyword, pointer,
    reset, rehydrate, getAsDictionary, buildApiPath
  };
});