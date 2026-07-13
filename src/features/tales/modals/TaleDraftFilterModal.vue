
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaleDraftFilterStore } from '../stores/TaleDraftFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { SortTypeSelectItems, CountrySelectItems, CategorySelectItems, TaleStatusSelectItems } from '@/utils/selectItemHelper'

const router = useRouter()
const filterStore = useTaleDraftFilterStore()
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
      <section>
        <h3 class="form-heading">Order</h3>
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
        <button type="button" @click="resetFilters" class="btn primary">Reset</button>
        <button type="submit" class="btn secondary">Filter</button>
      </div>

    </form>
  </div>
</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>