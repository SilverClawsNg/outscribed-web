<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive parameters matching your updated naming convention
const keyword = ref('')
const isLoading = ref(false)
const contentType = ref('tales') // Default targeted search domain

const searchTargets = [
  { label: 'Tales', value: 'tales', routeName: 'TaleLists' },
  { label: 'Insights', value: 'insights', routeName: 'InsightLists' },
  { label: 'Comments', value: 'comments', routeName: 'CommentLists' },
  { label: 'Writers', value: 'writers', routeName: 'WriterLists' }
]

function executeSearch() {
  const trimmedKeyword = keyword.value.trim()
  if (!trimmedKeyword) return

  isLoading.value = true

  // Find destination layout matching the active radio selection
  const target = searchTargets.find(t => t.value === contentType.value)
  
  if (target) {
    router.push({
      name: target.routeName,
      query: { keyword: trimmedKeyword }
    })
    
    // Clear search bar input text cleanly post-dispatch
    keyword.value = ''
  }
}
</script>

<template>

 <div class="form-container">
  
    <form @submit.prevent="executeSearch">

      <fieldset>
          <input 
            v-model="keyword" 
            type="search" 
            id="Keyword" 
            class="form-field" 
            placeholder="-- enter keyword --" 
          />
        </fieldset>

        <div class="ticks">
      <p v-for="target in searchTargets" 
        :key="target.value" 
        :class="{ 'is-active': contentType === target.value }">
        <input 
        v-model="contentType"
          type="radio" 
          name="searchContentType" 
          :value="target.value"
          :id="target.value"
      />
     <label :For=target.value>{{ target.label }} </label>
    </p>
      
      </div>

   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="isLoading"
            :class="{ active:isLoading }"
          >
            {{ isLoading ? 'Submitting...' : 'Search' }}
          </button>
        </div>
    </form>

  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>