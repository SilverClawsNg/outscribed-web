<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { APIError } from '@/api/apiTypes'
import { useCountryStore } from '../stores/CountryStore.ts'; 

// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import CountryComponent from '../components/CountryComponent.vue';
import { toLongDate, toRelativeTime } from '@/utils/dateExtensions'
import type { TagSortType } from '@/utils/enumHelper.ts';
import { CountryDescriptions } from '@/utils/descriptors.ts';
import { CountrySelectItems } from '@/utils/selectItemHelper.ts';
import SvgIcons from '@/components/SvgIcons.vue';

// 1. Setup Services & State
const countryStore = useCountryStore();
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
type SortType = 'alphabetical-asc' | 'alphabetical-desc' | 'popularity-desc' | 'popularity-asc';
const currentSort = ref<SortType>('popularity-desc'); // Default default

  // --- SORT & JUMP STATE ---
type SortDirection = 'desc' | 'asc';

const sortDirection = ref<SortDirection>('desc');
const selectedJumpCountry = ref<string>('');
const countryCardRefs = ref<Record<string, HTMLElement | null>>({});

// --- DEFINE PAGE INITIALIZATION ---

async function initPage() {

  // 1. Fetch from store
  const { success, error } = await countryStore.loadcountries()

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving country metrics. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// inside your HomeView.vue
onUnmounted(() => {
  countryStore.abort();
});

// --- TOGGLE SORT HANDLERS ---
function setSort(sortType: SortType) {
  currentSort.value = sortType;
}

// --- JUMP TO COUNTRY HANDLER ---
async function handleJumpToCountry(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const countryCode = selectElement.value;
  if (!countryCode) return;

  // Ensure sorting is reset or matches view if needed, then scroll into view
  await nextTick();
  const el = countryCardRefs.value[countryCode];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('discovery-card--highlight');
    setTimeout(() => el.classList.remove('discovery-card--highlight'), 2000);
  }
  selectedJumpCountry.value = ''; // Reset select after jump
}

// --- COMPUTED PROCESSED COUNTRIES ---
const countryTales = computed(() => {
  if (!countryStore.countriesMetrics?.countries) return null;

  const countries = [...countryStore.countriesMetrics.countries];

  if (countries.length === 0) {
    return { focusCountry: null, pillCountries: [], remainingCountries: [] };
  }

  // 1. Apply the exact selected sort strategy
  countries.sort((a, b) => {
    if (currentSort.value === 'alphabetical-asc' || currentSort.value === 'alphabetical-desc') {
      const nameA = CountryDescriptions[a.country] || a.country;
      const nameB = CountryDescriptions[b.country] || b.country;
      const comparison = nameA.localeCompare(nameB);
      return currentSort.value === 'alphabetical-asc' ? comparison : -1 * comparison;
    } else {
      // Popularity (talesCounter)
      const comparison = b.talesCounter - a.talesCounter;
      // popularity-desc: highest first (b - a)
      // popularity-asc: lowest first (a - b)
      return currentSort.value === 'popularity-desc' ? comparison : -1 * comparison;
    }
  });

  // 2. Slice into structural layout tiers
  const focusCountry = countries[0];
  const pillCountries = countries.slice(1, 5);
  const remainingCountries = countries.slice(5);

  return { focusCountry, pillCountries, remainingCountries };
});
</script>

<template>

   <template v-if="isLoading">

    <div class="loader" role="status" aria-label="Loading homepage">
  <p class="loader__dot"></p>
</div>

  </template>

   <template v-else-if="loadingError">

      <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.definition" #actions>
           <button class="btn btn--primary"  @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

  <template v-else-if="countryStore.countriesMetrics?.countries && countryStore.countriesMetrics.countries.length > 0">
  <header class="page-header">
    <h1 class="page-header__title">Browse Countries</h1>
    <p class="page-header__subtitle">
      OutScribed stories may raise global issues as well as focus on specific countries.
    </p>
  </header>

  <!-- TOP CONTAINER (Focus Card + 4 Pill Cards) -->
  <div class="discovery-top-container" v-if="countryTales && countryTales.focusCountry">

    <div class="discovery-top-container__focus">
      <CountryComponent
        :country="countryTales.focusCountry" 
        type="focus" 
      />
    </div>

    <div class="discovery-top-container__pills">
      <CountryComponent 
        v-for="country in countryTales.pillCountries" 
        :key="country.country"
        :country="country" 
        type="pill" 
      />
    </div>
  </div>

  <div class="page-divider" v-if="countryTales?.remainingCountries.length">
    <div class="page-divider__lines">
      <p class="page-divider__lines--item"></p>
      <p class="page-divider__lines--item"></p>
    </div>
  </div>

  <!-- LOWER CONTAINER (Remaining Countries Grid) -->
  <div class="discovery-lower-container" v-if="countryTales && countryTales.remainingCountries.length">
    <CountryComponent 
      v-for="country in countryTales.remainingCountries" 
      :key="country.country"
      :country="country" 
      type="pill" 
    />
  </div>

  <!-- FIXED BOTTOM SORT FOOTER BAR (4 Compact Actions) -->
    <footer class="page-footer-bar">
      <div class="page-footer-bar__inner">
        
        <!-- 1. A-Z Sort -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: currentSort === 'alphabetical-asc' }"
          @click="setSort('alphabetical-asc')"
          title="Alphabetical A-Z"
        >
          <span class="footer-filter-label">A-Z</span>
        </button>

        <!-- 2. Z-A Sort -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: currentSort === 'alphabetical-desc' }"
          @click="setSort('alphabetical-desc')"
          title="Alphabetical Z-A"
        >
          <span class="footer-filter-label">Z-A</span>
        </button>

        <!-- 3. Most Popular (Up Arrow / Highest Tales) -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: currentSort === 'popularity-desc' }"
          @click="setSort('popularity-desc')"
          title="Most Popular"
        >
          <SvgIcons name="uparrow" :size="16" />
          <span class="footer-filter-label-responsive">Popular</span>
        </button>

        <!-- 4. Least Popular (Down Arrow / Lowest Tales) -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: currentSort === 'popularity-asc' }"
          @click="setSort('popularity-asc')"
          title="Least Popular"
        >
          <SvgIcons name="downarrow" :size="16" />
          <span class="footer-filter-label-responsive">Quiet</span>
        </button>

      </div>
    </footer>

 
  
  <!-- Fixed Footer Bar with Sort Icons & Jump-To Select... -->
</template>

    <template v-else>

         <div class="container">

        <PageStatusMessage 
              title="Error Loading Countries!" 
              message="We encountered an error while loading countries."
              icon="fail" 
              :is-standalone="true"
            />
        </div>

      </template>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/discovery-container.less";
</style>