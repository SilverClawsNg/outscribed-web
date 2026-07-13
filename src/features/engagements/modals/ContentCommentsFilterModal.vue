
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useContentCommentsFilterStore } from '../stores/ContentCommentsFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { SortTypeSelectItems} from '@/utils/selectItemHelper'

const filterStore = useContentCommentsFilterStore()
const modalStore = useModalStore()

function resetFilters() {
  filterStore.reset()
}

function applyFilter() {
  
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
          <fieldset>
          <input 
            v-model="filterStore.username" 
            type="text" 
            id="Username" 
            class="form-field" 
            placeholder="-- enter username --" 
          />
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