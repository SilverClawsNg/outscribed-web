
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValidContentType, getValidGeneralSortType, getValidActivityType
} from '@/utils/validators';
import { getStoredAnchor, type TypeLabel } from '@/utils/anchorStorage';


export const useTimelineFilterStore = defineStore('timelineFilter', () => {

    const activeTypeLabel = ref<TypeLabel>('timeline');
    const activeType = ref<string | null>(null);
  
    // Set current list contextual types
    function setActiveType(typeLabel: TypeLabel, type: string | null) {
      activeTypeLabel.value = typeLabel;
      activeType.value = type;
    }
  
  
 // --- 1. STATE DEFINITIONS ---
  const sort = ref<string | null>(null)
  const contenttype = ref<string | null>(null)
  const activity = ref<string | null>(null)
  
  const keyword = ref<string | null>(null)
  const isprivate = ref<string | null>(null)
  const isbroadcast = ref<string | null>(null)
  const broadcasterid = ref<string | null>(null)
  const broadcaster = ref<string | null>(null)
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
    sort.value = '-1'
    contenttype.value = '-1'
    activity.value = '-1'
    
    keyword.value = ''
    isprivate.value = ''
    isbroadcast.value = ''
    broadcasterid.value = ''
    broadcaster.value = ''
    pointer.value = '1'
  }

  // --- 4. REHYDRATE FROM ROUTE QUERY ---
  function rehydrate(queryParameters: Record<string, any>): { isClean: boolean } {

    reset() // Reset to clean state framework first

     let wasClean = true

    if (queryParameters && Object.keys(queryParameters).length > 0) {

      if(queryParameters.sort){
     // 🎯 Parse & Validate Sort
  const validatedSort = getValidGeneralSortType(queryParameters.sort)
  sort.value = validatedSort || null
        if(!validatedSort) wasClean = false
      }
 

  if(queryParameters.contenttype){
  // 🎯 Parse & Validate Content (Accepts lowercase from URL, stores PascalCase)
  const validatedContent = getValidContentType(queryParameters.contenttype)
  contenttype.value = validatedContent || null
    if(!validatedContent) wasClean = false
  }
 

  if(queryParameters.activity){
   // 🎯 Parse & Validate Activity
  const validatedActivity = getValidActivityType(queryParameters.activity)
  activity.value = validatedActivity || null
    if(!validatedActivity) wasClean = false
  }
 
  if(queryParameters.isprivate){
      isprivate.value = parseBoolean(queryParameters.isprivate)
  }

   if(queryParameters.isbroadcast){
      isbroadcast.value = parseBoolean(queryParameters.isbroadcast)
   }

   if(queryParameters.keyword){
    // 🎯 Category B: Text Inputs & Identity Flags (Retain clean null profiles)
    keyword.value = parseString(queryParameters.keyword)
   }

    if(queryParameters.broadcasterid){
       broadcasterid.value = parseString(queryParameters.broadcasterid)
    }

    if(queryParameters.broadcaster){
       broadcaster.value = parseString(queryParameters.broadcaster)
    }

    }

return { isClean: wasClean }

  }

function getAsDictionary(): Record<string, string> {

  // 1. Collect all raw state values into a temporary workspace object
  const rawValues: Record<string, any> = {
    sort: sort.value,
    contenttype: contenttype.value,
    activity: activity.value,
    keyword: keyword.value,
    isprivate: isprivate.value,
    isbroadcast: isbroadcast.value,
    broadcasterid: broadcasterid.value,
    broadcaster: broadcaster.value,
    pointer: '1' // Reset pagination on new filter execution
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

    if (activity.value && activity.value !== '-1') 
      urlParams.append('activity', activity.value);

    if (isprivate.value && isprivate.value.trim() !== '' && (isprivate.value.trim() === 'true' || isprivate.value.trim() === 'false')) 
      urlParams.append('isprivate', isprivate.value);

    if (isbroadcast.value  && isbroadcast.value.trim() !== ''  && (isbroadcast.value.trim() === 'true' || isbroadcast.value.trim() === 'false')) 
      urlParams.append('isbroadcast', isbroadcast.value);

    if (broadcasterid.value  && broadcasterid.value.trim() !== '') 
      urlParams.append('broadcasterid', broadcasterid.value);

    if (broadcaster.value  && broadcaster.value.trim() !== '') 
      urlParams.append('broadcaster', broadcaster.value);

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
    sort, contenttype, activity, isprivate, isbroadcast, broadcasterid, broadcaster, keyword, pointer,activeType, activeTypeLabel,
    reset, rehydrate, getAsDictionary, buildApiPath, setActiveType
  };
});