
<script setup lang="ts">

import { useRouter } from 'vue-router'
import { useTaleListFilterStore } from '../stores/TaleListFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { SortTypeSelectItems, CountrySelectItems, CategorySelectItems, GeneralSortTypeSelectItems} from '@/utils/selectItemHelper'
import { computed } from 'vue'
import type { PrivateList } from '@/utils/enumHelper'

const router = useRouter()
const filterStore = useTaleListFilterStore()
const modalStore = useModalStore()

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const type = computed(() => props.payload as PrivateList)

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

   <!-- 3. Dataset Result Record Filtering Parameters -->
      <section>

        <h3 class="form-heading">Filter</h3>
       
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

      <template v-if="type === 'saves'">
        <fieldset>
          <div class="ticks">
              <input 
                    v-model="filterStore.isactive" 
                    type="checkbox" 
                    id="IncludeInactiveSaves"
                  />
                <label For="IncludeInactiveSaves">Tick to include inactive saves </label>
            </div>
          </fieldset>
      </template>

       <template v-if="type === 'votes'">
         <fieldset>
          <div class="ticks">
             <p>
              <input 
                type="radio" 
                id="Upvote" 
                value="Upvote" 
                name="votetype" 
                v-model="filterStore.votetype"
              />
              <label for="Upvote">Only Upvotes</label>
            </p>
            <p>
              <input 
                type="radio" 
                id="Downvote" 
                value="Downvote" 
                name="votetype" 
                v-model="filterStore.votetype"
              />
              <label for="Downvote">Only Downvotes</label>
            </p>

          </div>
        </fieldset>
      </template>

      <!-- 4. Dataset Result Record Ordering Parameters -->
      <section>
        <h3 class="form-heading">Order</h3>
        <template v-if="type">
            <fieldset>
                <select v-model="filterStore.sort"  class="form-field">
                    <option value="-1">-- sort by --</option>
                    <option v-for="item in GeneralSortTypeSelectItems" :key="item.value" :value="item.value">
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
        <button type="button" @click="resetFilters" class="btn primary">Reset</button>
        <button type="submit" class="btn secondary">Filter</button>
      </div>

    </form>
  </div>
</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>