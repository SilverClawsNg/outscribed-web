<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { getValidCategory } from '@/utils/validators'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import type { CreateRequest, CreateTalePayload } from '../types/TalesTypes'

import { CategorySelectItems } from '@/utils/selectItemHelper'

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const props = defineProps<{
  payload?: CreateTalePayload | null
}>()

const formData = ref<CreateRequest>({
  title: '',
  category: '-1' as any,
  country: null
})

const taleStore = useTaleDraftStore()
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const formSubmitted = ref(false)

const titleLength = computed(() => formData.value.title?.length || 0)

const validationErrors = computed(() => {
  const titleText = formData.value.title || ''
  const parsedCategory = getValidCategory(formData.value.category)

  return {
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',
    category: !parsedCategory
      ? 'Please select a category.'
      : ''
  }
})

const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

watch(
  [isFormValid, formSubmitted],
  ([isValid, submitted]) => {
    if (!submitted) return

    if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  },
  { immediate: true }
)

onBeforeMount(() => {
  
  resetProgress()
})


async function handleFormSubmission() {
  formSubmitted.value = true

  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await taleStore.createTale(formData.value)

  if (!success) {
    if (error) {
      setError(error)
    } else {
      setWarning('An unknown error occurred. Refresh page and try again')
    }
  } else {
    taleStore.setCurrentAsideView('detail');
  }
}
</script>

<template>

  <div class="form-container">

      <FormProgress :progress="progressState" />

      <form @submit.prevent="handleFormSubmission" autocomplete="off">
        <fieldset :disabled="progressState.type === 'Loading'">
          <input 
            v-model="formData.title" 
            type="text" 
            id="Title" 
            class="form-field" 
            placeholder="Title" 
          />
          <span 
            class="character-counter" 
            :class="{ 
              'is-warning': titleLength > 100 && titleLength <= 128,
              'is-over-limit': titleLength > 128 
            }"
          >
            {{ titleLength }}/128
          </span>
        </fieldset>
        <span v-if="formSubmitted && validationErrors.title" class="validation-message">
          {{ validationErrors.title }}
        </span>

        <fieldset :disabled="progressState.type === 'Loading'">
          <select v-model="formData.category" class="form-field">
            <option value="-1">-- select category --</option>
            <option v-for="item in CategorySelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </fieldset>
        <span v-if="formSubmitted && validationErrors.category" class="validation-message">
          {{ validationErrors.category }}
        </span>

        <div class="button-holder">
          <button 
            type="submit" 
            class="btn btn--secondary"  
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Create Draft' }}
          </button>
        </div>
      </form>
    </div>
    
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>