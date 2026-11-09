<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { APIError } from '@/api/apiTypes'
import { useCategoryStore } from '../stores/CategoryStore.ts'; 

// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import CategoryComponent from '../components/CategoryComponent.vue';
import { toLongDate, toRelativeTime } from '@/utils/dateExtensions'

// 1. Setup Services & State
const categoryStore = useCategoryStore();
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 1. Fetch from store
  const { success, error } = await categoryStore.loadcategories()

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving category metrics. Refresh page and try again.'
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
  categoryStore.abort();
});

// Assuming store.categories contains objects like: { name: Category, talesCounter: number, slug: string }
const categorizedTales = computed(() => {

if(categoryStore.categoriesMetrics?.categories == null) return;

  const categories = [...categoryStore.categoriesMetrics?.categories];

  if (categories.length === 0) {
    return {
      focusCategory: null,
      topPillCategories: [],
      remainingCategories: []
    };
  }

  // Sort descending by talesCounter
  categories.sort((a, b) => b.talesCounter - a.talesCounter);

  // 1. Top focus category (1 item)
  const focusCategory = categories[0];

  // 2. Next 4 categories for your primary grid (2fr, 1fr, 1fr)
  const pillCategories = categories.slice(1, 5);

  // 3. All remaining categories for your secondary grid (4 column, 1fr)
  const remainingCategories = categories.slice(5);

  return {
    focusCategory,
    pillCategories,
    remainingCategories
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

  <template v-else-if="categoryStore.categoriesMetrics?.categories && categoryStore.categoriesMetrics.categories.length > 0">
    
  <header class="page-header">
    <h2 class="page-header__title">
      Top Categories
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
    </div>
       <time class="page-header__date">{{ toRelativeTime(categoryStore.categoriesMetrics.lastUpdatedAt) }}</time>
    </header>

 <div class="top-segment" v-if="categorizedTales && categorizedTales.focusCategory">
  
  <!-- 1. FOCUS CATEGORY (Most tales - styled prominently) -->

  <div class="top-segment__focus">

    <CategoryComponent 
        :category="categorizedTales.focusCategory" 
        type="focus" 
      />
    
  </div>

   <div class="top-segment__pills">

    <CategoryComponent 
        v-for="category in categorizedTales.pillCategories" 
        :key="category.category"
        :category="category" 
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

<div class="lower-segment"  v-if="categorizedTales && categorizedTales.remainingCategories.length">

   <CategoryComponent 
        v-for="category in categorizedTales.remainingCategories" 
        :key="category.category"
        :category="category" 
        type="pill" 
      />

</div>

  </template>

    <template v-else>

          <PageStatusMessage 
              title="Error loading categories!" 
              message="We encountered an error while loading categories."
              icon="fail" 
              :is-standalone="true"
            />

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