
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommentListFilterStore } from '../stores/CommentListFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { GeneralSortTypeSelectItems, SortTypeSelectItems, LimitedContentTypeSelectItems } from '@/utils/selectItemHelper'
import type { PrivateList } from '@/utils/enumHelper'

const router = useRouter()
const filterStore = useCommentListFilterStore()
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

<fieldset class="with-ticks">
    
<template v-for="item in LimitedContentTypeSelectItems" :key="item.value">
  
      <div class="ticks">
       <input
          type="checkbox"
          :value="item.value"
          v-model="typeSelected"
        />
           <label>
        {{ item.label }}
      </label>
      </div>
  
  </template>
  </fieldset>
 
  
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

    </section>
   
     
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