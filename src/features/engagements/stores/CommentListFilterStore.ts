
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
   getValidContentType, getValidSortType, getValidVoteType
} from '@/utils/validators'; 
import { getStoredAnchor, type TypeLabel } from '@/utils/anchorStorage';

export const useCommentListFilterStore = defineStore('commentListFilter', () => {

    const activeTypeLabel = ref<TypeLabel>('comment');
    const activeType = ref<string | null>(null);
  
    // Set current list contextual types
    function setActiveType(typeLabel: TypeLabel, type: string | null) {
      activeTypeLabel.value = typeLabel;
      activeType.value = type;
    }
  
// State
const username = ref<string | null>(null)
const contenttype = ref<string | null>(null)
const votetype = ref<string | null>(null)

const keyword = ref<string | null>(null);
const sort = ref<string | null>(null)
const pointer = ref<string | null>('1');
const isactive = ref<string | null>(null);

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
    username.value = ''
    isactive.value=''
    contenttype.value = '-1'
    votetype.value = '-1'

    keyword.value = '';
    pointer.value = '1';
  }

  // 1. Rehydrate from URL parameters object
function rehydrate(queryParameters: Record<string, any>): { isClean: boolean }{
   
    reset(); // Evict current filters to cleanly build the fresh reality

    let wasClean = true

    if (queryParameters && Object.keys(queryParameters).length > 0) {

if(queryParameters.contenttype){
     // 🎯 Parse & Validate Content (Accepts lowercase from URL, stores PascalCase)
    const validatedContent = getValidContentType(queryParameters.contenttype)
    contenttype.value = validatedContent || null
    if(!validatedContent) wasClean = false
  
}

if(queryParameters.username){
   // 🎯 Parse & Validate Activity
  username.value = parseValue(queryParameters.username)
}

if(queryParameters.isactive){
   // 🎯 Parse & Validate Activity
  isactive.value = parseValue(queryParameters.isactive)
}

if(queryParameters.keyword){
   // 🎯 Parse & Validate Activity
  keyword.value = parseValue(queryParameters.keyword)
}


if(queryParameters.votetype){
   // 🎯 Parse & Validate Activity
    const validatedVote = getValidVoteType(queryParameters.votetype)
    votetype.value = validatedVote || null
    if(!validatedVote) wasClean = false
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
      contenttype: contenttype.value,
      votetype: votetype.value,
      isactive: isactive.value,
      keyword: keyword.value,
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
  function buildApiPath(baseRoute: string, overridePointer?: string | null, overrideAnchor?: string | null): string {
    const urlParams = new URLSearchParams();

    if (sort.value && sort.value !== '-1') 
      urlParams.append('sort', sort.value);

    if (contenttype.value && contenttype.value !== '-1') 
      urlParams.append('contenttype', contenttype.value);

    if (username.value && username.value.trim() !== '') 
      urlParams.append('username', username.value);

    if (votetype.value && votetype.value !== '-1') 
      urlParams.append('votetype', votetype.value);

      if (isactive.value && isactive.value.trim() !== '') 
      urlParams.append('isactive', isactive.value);

    if (keyword.value && keyword.value.trim() !== '') 
      urlParams.append('keyword', keyword.value);

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
      urlParams.append('pointer', currentPointer);

    let resolvedAnchor: string | null = null;

  if (overrideAnchor) {
    // Explicit override passed (e.g., fetching Page 2+ for ANY feed: public or private)
    resolvedAnchor = overrideAnchor;
  } else if (activeType.value) {
    // Initial load (Page 1) for a PRIVATE list: pull from localStorage fallback
    const storageKey = `${activeTypeLabel.value}:anchor:${activeType.value}`;
    resolvedAnchor = localStorage.getItem(storageKey);
  }
  // Note: Initial load (Page 1) for PUBLIC lists (activeType === null) will remain null.

  if (resolvedAnchor) {
    urlParams.append('anchor', resolvedAnchor);
  }
    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    sort, username, contenttype, keyword, pointer, activeType, activeTypeLabel, isactive, votetype,
    reset, rehydrate, getAsDictionary, buildApiPath, setActiveType
  };
});