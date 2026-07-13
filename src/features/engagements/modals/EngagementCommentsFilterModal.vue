
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEngagementCommentsFilterStore } from '../stores/EngagementCommentsFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { GeneralSortTypeSelectItems, LimitedContentTypeSelectItems } from '@/utils/selectItemHelper'

const router = useRouter()
const filterStore = useEngagementCommentsFilterStore()
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

// Bind directly to array of selected types
const typeSelected = computed({
  get() {
    return filterStore.contenttype || ''
  },
  set(newValue: string) {
    filterStore.contenttype = newValue || ''
  }
})

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
      <section>
        <fieldset>
              <legend>Search by keyword</legend>

          <input 
            v-model="filterStore.keyword" 
            type="text" 
            id="Keyword" 
            class="form-field" 
            placeholder="-- enter keyword --" 
          />
        </fieldset>
           <fieldset>
                <legend>Search by username</legend>

          <input 
            v-model="filterStore.username" 
            type="text" 
            id="Username" 
            class="form-field" 
            placeholder="-- enter username --" 
          />
        </fieldset>
      </section>

   <!-- 3. Dataset Result Record Filtering Parameters -->
    <section>

    <fieldset>
    <legend>Filter by type</legend>
    <div v-for="item in LimitedContentTypeSelectItems" :key="item.value">
      <label>
        <input
          type="checkbox"
          :value="item.value"
          v-model="typeSelected"
        />
        {{ item.label }}
      </label>
    </div>
  </fieldset>
    </section>
   
      <!-- 4. Dataset Result Record Ordering Parameters -->
      <section>
        <fieldset>
              <legend>Order</legend>

                <select v-model="sortSelected"  class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in GeneralSortTypeSelectItems" :key="item.value" :value="item.value">
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