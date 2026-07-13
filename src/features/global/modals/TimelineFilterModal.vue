
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimelineFilterStore } from '../stores/TimelineFilterStore'
import { useModalStore } from '@/stores/modalStore'
import { GeneralSortTypeSelectItems, ContentTypeSelectItems } from '@/utils/selectItemHelper'
import { filterSelectItems } from '@/utils/selectItemFilterHelper'
import { ActivityTypeDescriptions } from '@/utils/descriptors'

const router = useRouter()
const filterStore = useTimelineFilterStore()
const modalStore = useModalStore()

// Mocking your enum drop down lookup collections (Replace with your actual dictionary/enum utilities)
const activityItems = ref<{ value: string; label: string }[]>([])

// Proxy computed property to map the Blazor layout's multi-property radio flags cleanly
const scopeSelection = computed({
  get() {
    if (filterStore.isprivate === 'true') return 'private'
    if (filterStore.isbroadcast === 'true') return 'broadcast'
    return 'all'
  },
  set(value: 'all' | 'private' | 'broadcast') {
    if (value === 'private') {
      filterStore.isprivate = 'true'
      filterStore.isbroadcast = null
    } else if (value === 'broadcast') {
      filterStore.isbroadcast = 'true'
      filterStore.isprivate = null
    } else {
      filterStore.isprivate = null
      filterStore.isbroadcast = null
    }
  }
})

const isActivityDisabled = computed(() => activityItems.value.length === 0)

// 🌟 The core filtering wrapper logic
function syncActivityDropdown() {

  if (filterStore.content && filterStore.content !== '-1') {
    // Populate your local UI list array using the generic dictionary utility
    activityItems.value = filterSelectItems(
      ActivityTypeDescriptions,
      filterStore.content,
      '_',
      -1
    )

  } else {
    activityItems.value = []
  }
}

function handleContentChanged() {

  filterStore.activity = '-1'
 syncActivityDropdown()

}

// 2. 🌟 THE FIX: Triggered when the component boots up from a pre-filtered URL path
onMounted(async () => {
  // 1. First, build the available select options array
  syncActivityDropdown()

})

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

const contentSelected = computed({
  // What the HTML dropdown sees: translate null to '-1'
  get() {
    return filterStore.content || '-1'
  },
  // What the store sees: translate '-1' back to null
  set(newValue: string) {
    filterStore.content = newValue === '-1' ? null : newValue
  }
})

const activitySelected = computed({
  // What the HTML dropdown sees: translate null to '-1'
  get() {
    return filterStore.activity || '-1'
  },
  // What the store sees: translate '-1' back to null
  set(newValue: string) {
    filterStore.activity = newValue === '-1' ? null : newValue
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
      </section>

      <!-- 2. Target Visibility Scopes Radio Controls -->
      <section>
        <h3 class="form-heading">Filter</h3>
        <div class="ticks">
          <p>
            <input 
              type="radio" 
              id="All" 
              value="all" 
              v-model="scopeSelection" 
            />
            <label for="All">All</label>
          </p>
          <p>
            <input 
              type="radio" 
              id="Personal" 
              value="private" 
              v-model="scopeSelection" 
            />
            <label for="Personal">Personal</label>
          </p>
          <p>
            <input 
              type="radio" 
              id="Broadcast" 
              value="broadcast" 
              v-model="scopeSelection" 
            />
            <label for="Broadcast">Broadcast</label>
          </p>
        </div>

        <!-- 3. Dynamic Cascade Content Type Select Dropdowns -->
           <fieldset>
                <select v-model="contentSelected" class="form-field" @change="handleContentChanged">
                    <option value="-1">-- filter by content --</option>
                    <option v-for="item in ContentTypeSelectItems" :key="item.value" :value="item.value">
                    {{ item.label }}
                    </option>
                </select>
            </fieldset>

        <fieldset>
        
          <select 
            class="form-field" 
            v-model="activitySelected" 
            :disabled="isActivityDisabled">
            <option value="-1">-- filter by activity --</option>
            <option v-for="item in activityItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </fieldset>
      </section>

      <!-- 4. Dataset Result Record Ordering Parameters -->
      <section>
        <h3 class="form-heading">Order</h3>
        <fieldset>
                <select v-model="sortSelected" class="form-field">
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