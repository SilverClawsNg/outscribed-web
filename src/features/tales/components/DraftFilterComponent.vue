
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaleDraftFilterStore } from '../stores/TaleDraftFilterStore'
import { SortTypeSelectItems, CountrySelectItems, CategorySelectItems, TaleStatusSelectItems } from '@/utils/selectItemHelper'
import { useTaleDraftStore } from '../stores/TaleDraftStore';

const router = useRouter()
const filterStore = useTaleDraftFilterStore()
const taleStore = useTaleDraftStore();

function resetFilters() {
  filterStore.reset()
}

async function applyFilter() {
  
  // 1. Silently update the browser URL for bookmarking support
  await router.replace({
    path: router.currentRoute.value.path,
    query: filterStore.getAsDictionary()
  })

  // 2. EXPLICIT TRIGGER: Update the committed active path state
  filterStore.setApiPath(taleStore.baseRoute)

  // 2. Switch the aside view back to list. 
  // The List component will automatically react, build the query, and fetch.
  taleStore.setCurrentAsideView('list')
}

</script>

<template>
  <div class="form-container">
    <form @submit.prevent="applyFilter">
      
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

   <!-- 3. Dataset Result Record Filtering Parameters -->
       <section class="form-filter-section">
         
        <h3>Filter</h3>
        <fieldset>
                <select v-model="filterStore.status" class="form-field">
                    <option value="-1">-- by status --</option>
                    <option v-for="item in TaleStatusSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
             <fieldset>
                <select v-model="filterStore.category" class="form-field">
                    <option value="-1">-- by category --</option>
                    <option v-for="item in CategorySelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
             <fieldset>
                <select v-model="filterStore.country" class="form-field">
                    <option value="-1">-- by country --</option>
                    <option v-for="item in CountrySelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
      </section>

      <!-- 4. Dataset Result Record Ordering Parameters -->
     <section class="form-filter-section">
         
        <h3>Order</h3>
        <fieldset>
                <select v-model="filterStore.sort"  class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in SortTypeSelectItems" :key="item.value" :value="item.value">
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