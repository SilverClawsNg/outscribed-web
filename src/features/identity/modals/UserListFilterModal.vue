
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserListFilterStore } from '../stores/UserListFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { SortTypeSelectItems, CountrySelectItems, CategorySelectItems } from '@/utils/selectItemHelper'

const router = useRouter()
const filterStore = useUserListFilterStore()
const modalStore = useModalStore()

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const type = computed(() => props.payload as string)

function resetFilters() {
  filterStore.reset()
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
          <fieldset class="has-username">
             <span class="at-symbol" aria-hidden="true">@</span>
          <input 
            v-model="filterStore.username" 
            type="text" 
            id="Username" 
            class="form-field" 
            placeholder="Username"  
          />
        </fieldset>
      </section>

   <!-- 3. Dataset Result Record Filtering Parameters -->
      <section class="form-filter-section">
         
        <h3>Filter</h3>
       
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
        <template v-if="type">
            <fieldset>
                <select v-model="filterStore.sort"  class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in SortTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
        </template>
         <template v-else>
            <fieldset>
                <select v-model="filterStore.sort"  class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in SortTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
        </template>
      
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