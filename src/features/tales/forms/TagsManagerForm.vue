<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { TagRequest, UntagRequest } from '../types/TalesTypes'
import SvgIcons from '@/components/SvgIcons.vue'

export interface TagDto {
  tagId: string
  name: string
}

const MAX_TAGS = 10

const taleStore = useTaleDraftStore()

const newTagInput = ref('')
const isSubmitted = ref(false)

// Local tag validation message state for PageStatusMessage
const validationWarning = ref<{ title: string; message: string } | null>(null)

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, setSuccess, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)



// Local TagDto array initialized from active tale
const tagList = ref<TagDto[]>([...(taleStore.activeTale?.tags || [])])

const remainingTags = computed(() => MAX_TAGS - tagList.value.length)
const isAtLimit = computed(() => tagList.value.length >= MAX_TAGS)


function handleRemoveTag(index: number) {
  tagList.value.splice(index, 1)
  validationWarning.value = null
}

const isCompleted = ref(false) // Tracks local completed state

// --- FORM DATA ---
const tagFormData = ref<TagRequest>({
   taleId: '',
  name: ''
})

const untagFormData = ref<UntagRequest>({
   taleId: '',
  tagId: ''
})

const isAdd = ref(false)
const currentTag = ref<string>('') 
    
// Function to clone active tale into isolated local form state
function populateFormFromStore() {
  if (!taleStore.activeTale) return

 // --- INITIALIZE FORM DATA FROM STORE ---
  tagFormData.value.taleId = taleStore.activeTale.taleId
  untagFormData.value.taleId = taleStore.activeTale.taleId
}

// 2. Watch for draft switches in the aside list and sync local form state
watch(
  () => taleStore.activeTale?.taleId,
  (newId, oldId) => {
    if (newId !== oldId) {
      populateFormFromStore()
    }
  },
  { immediate: true }
)

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!taleStore.activeTale) {
    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current tale details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
 
  populateFormFromStore()
  resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const tagLength = computed(() => tagFormData.value.name?.length || 0)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const tagText = tagFormData.value.name || '';

 const cleanedName = newTagInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')

 const isDuplicate = tagList.value.some(
    (tag) => tag.name.toLowerCase() === cleanedName
  )

 let tagError = '';

 if(tagText === '' || tagText.length < 3 || tagText.length > 32){
    tagError = 'Tag name must be between 3 and 32 characters';
 } else  if (isAtLimit.value) {
   tagError = `You cannot add more than ${MAX_TAGS} tags to a story.`
  } else  if (isDuplicate) {
    tagError = `"${cleanedName}" has already been added to this story.`
  }

  return {
    name: tagError
  }
})

// 3. Form is valid if all computed error fields are empty strings
const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

// --- 4. The centralized warning to ensures the to warning is in sync with the form field warnings ---
// It monitors form health and automatically dictates top-level notification state
watch(
  [isFormValid, formSubmitted], 
  ([isValid, submitted]) => {
    // Don't disturb the user if they haven't tried to submit yet
    if (!submitted) return

    if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
      // 🎯 Only reset if we are clearing a warning!
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  }, 
  { immediate: true }
)

// --- SUBMIT FORM TO STORE ---
async function handleTagSubmission() {

  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

 const { success, error } = await taleStore.addTaleTag(tagFormData.value!)

  if(!success){

    if(error){
    setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    setSuccess(tagFormData.value.name + ' was successfully added')

      tagFormData.value.name = ''

      formSubmitted.value = false
  }
  
}

// --- SUBMIT FORM TO STORE ---
async function handleUntagSubmission(tagId:string, name: string) {
  
startLoading()

isAdd.value = false
currentTag.value = tagId

 const { success, error } = await taleStore.removeTaleTag({
  taleId: untagFormData.value.taleId,
  tagId: tagId
})

  if(!success){

    if(error){
    setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
       resetProgress()
   formSubmitted.value = false
   taleStore.openPostUpdateModal('tags')
  }
  
}

</script>

<template>

  <div class="tags-manager">

    <div class="tags-manager__wrapper">

      <!-- Action Header -->
      <header class="tags-manager__header">
        <h1 class="tags-manager__title">Tags Manager</h1>
        <p class="tags-manager__description">Increase the discoverability of your story by 
            tagging it to relevant trending issues. 
        </p>
      </header>

      <div class="tags-card">

        <FormProgress :progress="progressState" :is-editor="true" />

         <!-- Confirmation Form Box -->
      <form id="add-tag-form" class="tags-card__form" @submit.prevent="handleTagSubmission">

        <label class="tags-card__label">
            Keep tags limited to three (words) separated by spacing. Do not prefix with # or other special characters.
            Keep concise and relevant e.g. <i> Government Corruption</i>, <i>Climate Change</i> etc.
        </label>

        <div class="tags-card__row">

            <div class="tags-card__row-input-wrapper">

                 <input
            v-model="tagFormData.name"
            type="text"
            placeholder="Type in tag name"
            class="tags-card__row-input"
          />
                 <span 
            class="tags-card__character-counter" 
            :class="{ 
              'is-warning': tagLength > 28  && tagLength <= 32,
              'is-over-limit': tagLength < 3  || tagLength > 32 
            }"
          >
            {{ tagLength }}/32
          </span>
            </div>
       
            <button 
                type="submit" 
                form="add-tag-form" 
                class="btn btn--secondary"  
                :disabled="progressState.type === 'Loading' || lockSubmission || taleStore.activeTale?.tags.length === MAX_TAGS"
                 @click="handleTagSubmission"
            >
           Add

            </button>

        </div>

          <div class="tags-card__row tags-card__row--offset">

         <span v-if="formSubmitted && validationErrors.name" class="tags-card__validation-message">
                {{ validationErrors.name }}
            </span>

        </div>
       
      </form>

         <div class="divider-multi divider-multi--thick"><span></span></div>

        <!-- Validation Error Bubble -->

         <label class="tags-card__label">
            Click box to remove existing tags
            <span 
            class="tags-card__character-counter" 
            :class="{ 
              'is-over-limit': taleStore.activeTale?.tags.length && (taleStore.activeTale?.tags.length >= (MAX_TAGS - 2))
            }"
          >
            {{ taleStore.activeTale?.tags.length.toLocaleString() }} / {{ MAX_TAGS }}
          </span>
        </label>
         
        <template v-if="tagList.length > 0">

            <ol class="tags-card__existing">
                <li
                    v-for="tag in taleStore.activeTale?.tags"
                    :key="tag.tagId || tag.name"
                >
                    <button
                    type="button"
                    class="tag-chip-btn"
                    :title="`Click to remove #${tag.name}`"
                     @click="handleUntagSubmission(tag.tagId, tag.name)"
                    >
                    <span class="tag-chip-btn__label">#{{ tag.name }}</span>
                    
                    <!-- Dome-Lid Trash Can Icon (Revealed on Hover) -->
                    <span class="tag-chip-btn__icon" aria-hidden="true">
                        <SvgIcons name="trash" :size="20" />
                    </span>
                    </button>
                </li>
            </ol>

        </template>

      </div>


    </div>

</div>

</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";


.tags-manager {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem;

  &__wrapper {
    width: 100%;
    max-width: @mid-width; /* Aligns with Studio 750px measure */
  }

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.3rem; // ~32px
    font-weight: 400;
    line-height: 1.2;
    color: var(--text-color);
    margin-bottom: 0.75rem;
  }

  &__description {
    color: var(--muted-text-color);
  }
}

/* Studio Confirmation Card */
.tags-card {
  background-color: var(--light-background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: @link-color;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  &__row{
    display: flex;
    column-gap: 0.5rem;
    width: 100%;

    &--offset{
        margin-top: 0.5rem;
    }
  }

  &__row-input-wrapper{
    position: relative;
    height: 100%;
    flex-grow: 1;
  }

  &__row-input{
    height: 3rem;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    width: 100%;
    padding: 0 0.5rem;
  }

  &__label {
    font-family: @font-heading;
    font-size: @text-sm;
    line-height: @line-height-ui;
    color: var(--muted-text-color);
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: inline-block;
    position:relative;
  }

 .tags-card__existing {
  list-style: none;
  padding: 0;
  counter-reset: tag-counter; // Initialize list counter
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  li {
    counter-increment: tag-counter; // Increment counter per item
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    position:relative;

      & svg{
         vertical-align: middle;
         margin-left: 0.5rem;
        }

    // Custom numbered prefix badge
    &::before {
      content: counter(tag-counter) ".";
      color: var(--text-color-muted, #64748b);
      font-weight: 700;
      margin-right: 2px;
    }
  }
}


   &__validation-message {
    font-size: 0.85rem;
    line-height:1.1rem;
    background-color: var(--text-color);
    color: var(--background-color);
    border-radius: 50px;
    padding: 1rem 0.6rem;
    max-width: 350px;
    text-align:center;
  }
  
    &__character-counter {
      position: absolute;
      right: 0.25rem;
      bottom: 0.25rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--muted-text-color);
      pointer-events: none; // Allows clicks to pass through to the input
      font-variant-numeric: tabular-nums; // Prevents counter width jitter when numbers change

      &.is-warning {
        color: @warning-color; // Amber when getting close
      }

      &.is-over-limit {
        color: @fatal-color; // Red when exceeded
        font-weight: 700;
      }
    }

}

</style>