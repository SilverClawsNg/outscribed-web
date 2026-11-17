
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTagFilterStore } from '../stores/TagFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { TagSortTypeSelectItems, ContentTypeSelectItems } from '@/utils/selectItemHelper'
import { filterSelectItems } from '@/utils/selectItemFilterHelper'

const router = useRouter()
const filterStore = useTagFilterStore()
const modalStore = useModalStore()

// Mocking your enum drop down lookup collections (Replace with your actual dictionary/enum utilities)
const activityItems = ref<{ value: string; label: string }[]>([])

const isActivityDisabled = computed(() => activityItems.value.length === 0)

function resetFilters() {
  filterStore.reset()
  activityItems.value = []
}

function applyFilter() {
  // 🔗 Vue Router handles translating the filter state straight to the browser url parameters footprint
  router.push({
    path: router.currentRoute.value.path,
    query: filterStore.getAsDictionary() // Generates a clean object removing all "-1" or null entries
  })

  // Dismiss modal window from presentation tree tracking index safely
  modalStore.pop()
}

const sortSelected = computed({
  // What the HTML dropdown sees: translate null to '-1'
  get() {
    return filterStore.sort || '-1'
  },
  // What the store sees: translate '-1' back to null
  set(newValue: string) {
    filterStore.sort = newValue === '-1' ? null : newValue
  }
})

</script>

<template>

  <div class="form-container">
    
    <form @submit.prevent="applyFilter">
      
      <!-- 1. Text Searching Content Inputs -->
     
      <!-- 1. Text Searching Content Inputs -->
       <section class="form-filter-section">
         
        <h3>Search</h3>

        <fieldset>
          <input 
            v-model="filterStore.keyword" 
            type="text" 
            id="Keyword" 
            class="form-field" 
            placeholder="Keyword"  
          />
        </fieldset>
        
      </section>
      <!-- 4. Dataset Result Record Ordering Parameters -->
       <section class="form-filter-section">
        <h3>Order</h3>
        <fieldset>
                <select v-model="sortSelected" class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in TagSortTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
      </section>

      <!-- 5. Form Actions Layout Triggers -->
      <div class="filter-buttons">
        <button type="button" @click="resetFilters" class="btn btn--primary" >Reset</button>
        <button type="submit" class="btn btn--secondary" >Filter</button>
      </div>

    </form>
  </div>
</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>