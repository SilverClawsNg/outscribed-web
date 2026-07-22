
<script setup lang="ts">

import { useRouter } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import { FaqCategorySelectItems } from '@/utils/selectItemHelper'

const router = useRouter()
const filterStore = useFaqListFilterStore()
const modalStore = useModalStore()

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
      <section>
        <h3 class="form-heading">Search</h3>
        <fieldset>
          <input 
            v-model="filterStore.keyword" 
            type="text" 
            id="Keyword" 
            class="form-field" 
            placeholder="-- enter keyword --" 
          />
        </fieldset>
      </section>

   <!-- 3. Dataset Result Record Filtering Parameters -->
      <section>
        <h3 class="form-heading">Filter</h3>
        <fieldset>
                <select v-model="filterStore.category" class="form-field">
                    <option value="-1">-- by category --</option>
                    <option v-for="item in FaqCategorySelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>
            
      </section>

      <!-- 5. Form Actions Layout Triggers -->
      <div class="filter-buttons">
        <button type="button" @click="resetFilters" class="btn primary">Reset</button>
        <button type="submit" class="btn secondary">Filter</button>
      </div>

    </form>
  </div>
</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>