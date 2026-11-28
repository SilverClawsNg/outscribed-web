<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 

// Sub-components & Stores
import { useModalStore } from '@/stores/modalStore'
import { mediaHelper } from '@/utils/mediaHelper'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue';
import { useLoginHint } from '@/utils/authHelper'
import { curateHomepageTales } from '@/utils/curateHomepageTales';
import CategoryComponent from '../components/CategoryComponent.vue';
import CountryComponent from '../components/CountryComponent.vue';
import WriterComponent from '../components/WriterComponent.vue';
import TaleTextComponent from '@/features/tales/components/TaleTextComponent.vue';
import HomepageHeroComponent from '../components/HomepageHeroComponent.vue';
import HomepageHeroTestComponent from '../components/HomepageHeroTestComponent.vue';
import HomepageRoadMapComponent from '../components/HomepageRoadMapComponent.vue';
import HomepageTrendingTagsComponent from '../components/HomepageTrendingTagsComponent.vue';
import HomepageHotTalesComponent from '../components/HomepageHotTalesComponent.vue';
import HomepageRecentTalesComponent from '../components/HomepageRecentTalesComponent.vue';
import HomepageUseCasesComponent from '../components/HomepageUseCasesComponent.vue';

// 1. Setup Services & State
const homepageStore = useHomeStore();
const modalStore = useModalStore()
const engage = useEngagement()
const router = useRouter()
const isLoggedIn = useLoginHint()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const isRecent = ref(false)

function handleCreateDraftClick() {
  modalStore.push('CreateTale', 'Create Tale')
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {
  const { success, error } = await homepageStore.loadhomecontents()

  if (!success) {
    if (error) {
      loadingError.value = error
    } else {
      loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occurred while retrieving homepage contents. Refresh page and try again.'
      );
    }
  }

  isLoading.value = false

  if (success) {
    await homepageStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

onUnmounted(() => {
  homepageStore.abort();
});

const homepageLayout = computed(() => {
  return curateHomepageTales(homepageStore.recentTales);
});

// Assuming homepageStore.categories is an array of objects like: { name: string, count: number, slug: string }
const categorizedTales = computed(() => {
  const categories = [...homepageStore.categories];
  
  if (categories.length === 0) return { focusCategory: null, pillCategories: [] };

  // Sort descending by count to find the category with the most tales
  categories.sort((a, b) => b.talesCounter - a.talesCounter);

  const focusCategory = categories[0];
  const pillCategories = categories.slice(1, 5); // Takes up to the next 5 top categories as pills

  return { focusCategory, pillCategories };
});

// Assuming homepageStore.categories is an array of objects like: { name: string, count: number, slug: string }
const countriesTales = computed(() => {
  const countries = [...homepageStore.countries];
  
  if (countries.length === 0) return { focusCountry: null, pillCountries: [] };

  // Sort descending by count to find the category with the most tales
  countries.sort((a, b) => b.talesCounter - a.talesCounter);

  const focusCountry = countries[0];
  const pillCountries = countries.slice(1, 6); // Takes up to the next 5 top categories as pills

  return { focusCountry, pillCountries };
});

</script>

<template>

  <HomepageHeroTestComponent/>

  <HomepageRoadMapComponent />

  <HomepageHotTalesComponent />

  <HomepageTrendingTagsComponent />

  <HomepageRecentTalesComponent />

  <HomepageUseCasesComponent />

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/discovery-container.less";


</style>