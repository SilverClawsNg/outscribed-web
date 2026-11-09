<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { APIError } from '@/api/apiTypes'
import { useCountryStore } from '../stores/CountryStore.ts'; 

// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import CountryComponent from '../components/CountryComponent.vue';
import { toLongDate, toRelativeTime } from '@/utils/dateExtensions'

// 1. Setup Services & State
const countryStore = useCountryStore();
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

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


// Assuming store.countries contains objects like: { name: Country, talesCounter: number, slug: string }
const countryTales = computed(() => {

if(countryStore.countriesMetrics?.countries == null) return;

  const countries = [...countryStore.countriesMetrics?.countries];

  if (countries.length === 0) {
    return {
      focusCountry: null,
      topPillCountries: [],
      remainingCountries: []
    };
  }

  // Sort descending by talesCounter
  countries.sort((a, b) => b.talesCounter - a.talesCounter);

  // 1. Top focus country (1 item)
  const focusCountry = countries[0];

  // 2. Next 4 countries for your primary grid (2fr, 1fr, 1fr)
  const pillCountries = countries.slice(1, 5);

  // 3. All remaining countries for your secondary grid (4 column, 1fr)
  const remainingCountries = countries.slice(5);

  return {
    focusCountry,
    pillCountries,
    remainingCountries
  };
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
        <h2 class="page-header__title">
          Top Countries
        </h2>
        <div class="page-header__lines">
          <p class="page-header__lines--item"></p>
          <p class="page-header__lines--item"></p>
        </div>
          <time class="page-header__date">{{ toRelativeTime(countryStore.countriesMetrics.lastUpdatedAt) }}</time>
        </header>
     
 <div class="top-segment" v-if="countryTales && countryTales.focusCountry">
  
  <!-- 1. FOCUS CATEGORY (Most tales - styled prominently) -->

  <div class="top-segment__focus">

    <CountryComponent
        :country="countryTales.focusCountry" 
        type="focus" 
      />
    
  </div>

   <div class="top-segment__pills">

    <CountryComponent 
        v-for="country in countryTales.pillCountries" 
        :key="country.country"
        :country="country" 
        type="pill" 
      />

  </div>

</div>

 <div class="page-divider">
    <div class="page-divider__lines">
      <p class="page-divider__lines--item"></p>
      <p class="page-divider__lines--item"></p>
    </div>
  </div>

<div class="lower-segment"  v-if="countryTales && countryTales.remainingCountries.length">

   <CountryComponent 
        v-for="country in countryTales.remainingCountries" 
        :key="country.country"
        :country="country" 
        type="pill" 
      />

</div>
    
  </template>

    <template v-else>

         <div class="container">

        <PageStatusMessage 
              title="Error Getting Countries!" 
              message="We encountered an error while retreiving countries leaderboard."
              icon="fail" 
              :is-standalone="true"
            />
        </div>

      </template>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

   .top-segment{
   
    max-width: calc(100% - 20px);
    margin: 0 auto;
    display: flex;
    gap: 2rem;

    @media @phone{
  width: @min-width;
  flex-direction: column;
  }
  
    @media @phablet{
  width: @mod-width;
  flex-direction: column;
  }

    @media @tablet{
  width: @mid-width;
   flex-direction: column;
  }
    
  @media @desktop, @laptop{
  width: @max-width;
  }

     &__focus{
      height: auto;
     
       background-color: @link-color;
        border-radius: 21px;
         display: flex;
        flex-direction: column;
        justify-content: flex-start;
         background-image: url("@/assets/images/patterns-background(1).png");
  background-position-x: right;
  background-position-y: bottom;
  background-repeat: no-repeat;
  background-position: contain;
  

  @media @phone{
background-size: 40%;
  }
  
    @media @tablet, @phablet, @phone{
  width: 100%;
  }

  @media @desktop, @laptop{
 width: 35%;
  }
     }

     &__pills{
      
      gap: 1rem;
      display: grid;
      
      @media @tablet, @phablet{
  width: 100%;
  grid-template-columns: 1fr;

  }
      
    @media @tablet, @phablet{
  width: 100%;
  grid-template-columns: 1fr 1fr;

  }

       @media @desktop, @laptop{
    width: 65%;
    grid-template-columns: 1fr 1fr;

       }
     }

   }

   /* Secondary Grid: 4 Equal Columns (1fr 1fr 1fr 1fr) */
.lower-segment {
   max-width: calc(100% - 20px);
    margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

   
  @media @desktop, @laptop{
  width: @max-width;
  }

  @media @tablet {
    grid-template-columns: repeat(2, 1fr);
    width: @mid-width;
  }

   @media @phablet {
    grid-template-columns: repeat(2, 1fr);
    width: @mod-width;
  }

  @media @phone {
    grid-template-columns: 1fr;
     width: @min-width;
  }
}

</style>