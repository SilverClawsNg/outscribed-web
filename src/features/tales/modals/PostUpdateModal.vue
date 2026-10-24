<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useTaleDraftStore, type MainCanvasView } from '../stores/TaleDraftStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useRouter } from 'vue-router'

const taleStore = useTaleDraftStore()
const activeTale = computed(() => taleStore.activeTale)
const router = useRouter()

const isPublished = computed(() => activeTale.value?.status != 'Created')


// Check section completeness
const missingRequirements = computed(() => {
  if (!activeTale.value) return []
  const missing: Array<{ section: 'basic' | 'details' | 'reality'; label: string }> = []

  if (!taleStore.hasBasicInfo()) {
    missing.push({ section: 'basic', label: 'Basic Information (includes title, category, country, & summary)' })
  }
  if (!taleStore.hasDetails()) {
    missing.push({ section: 'details', label: 'Story Details' })
  }
  if (!taleStore.hasRealityCheck()) {
    missing.push({ section: 'reality', label: 'Reality Check (includes title, summary, and optional source & url)' })
  }

  return missing
})

const isAllRequirementsMet = computed(() => missingRequirements.value.length === 0)

// Identify the next step in the authoring progression
const nextIncompleteSection = computed(() => {
  if (missingRequirements.value.length === 0) return null
  return missingRequirements.value[0]
})

// ----------------------------------------------------------------------------
// 3. UNIFIED CONFIGURATION DICTIONARY
// ----------------------------------------------------------------------------
const config = computed(() => {
  switch (taleStore.currentMainView) {
    case 'basic':
      return {
        title: 'Basic information updated',
      }
    case 'reality':
      return {
        title: 'Reality check updated',
      }
    case 'details':
      return {
        title: 'Story details updated',
      }
    }
})

const currentSection = computed(() => taleStore.activePostUpdateSection)

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && currentSection.value) {
    taleStore.closePostUpdateModal()
  }
}


function handleNextUpdate(section: MainCanvasView) {
taleStore.closePostUpdateModal()
 taleStore.setCurrentMainView(section);
}


onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="currentSection"
      class="studio-modal-backdrop"
      @click="taleStore.closePostUpdateModal()"
    >
      <div
        class="studio-modal"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="studio-modal__brand-ribbon"></div>

        <header class="studio-modal__header">

          <div class="studio-modal__meta">
            <span class="studio-modal__badge studio-modal__badge--success">SUCCESS</span>
            <h2 class="studio-modal__title">{{config?.title}}</h2>
          </div>

          <button
            type="button"
            class="studio-modal__close"
            aria-label="Close dialog"
            @click="taleStore.closePostUpdateModal()"
          >
            <SvgIcons name="close" :size="30" />
          </button>
        </header>

        <main class="studio-modal__body">
          <p class="studio-modal__message">
            Your changes have been successfully committed to your draft.
          </p>

           <!-- STATE 1: PUBLISHED STORY SUCCESS -->
      <template v-if="isPublished">

        <p>
          "Your changes have been saved. Since this story is live, updates are reflected immediately for readers."
        </p>

      </template>

    <!-- STATE 2: UNPUBLISHED & ALL SECTIONS COMPLETE -->
    <template v-else-if="!isAllRequirementsMet && !isPublished">

        <p>
        Complete the remaining requirement below to get your story ready for publication:
      </p>
       <p class="studio-modal__message--sub">{{ nextIncompleteSection?.label }}</p>

    </template>

    
    <!-- STATE 4: UNPUBLISHED & NO PHOTO -->
    <template v-else-if="isAllRequirementsMet && !isPublished && !taleStore.hasPhoto">

      <p>
        All required story sections are complete! Your tale is ready to go live. 
        A cover photo is not required to publish a story but it helps add to the aesthestics and once your story is engaged, you may be unable to add later.
      </p>
    
    </template>

    <!-- STATE 3: UNPUBLISHED & INCOMPLETE SECTIONS REMAIN -->
    <template v-else-if="isAllRequirementsMet && !isPublished">

      <p>
        All required story sections are complete! Your tale is ready to go live. 
        Note that tags are optional and not included in the completion check but you may add them at any time you wish.
      </p>
    
    </template>

        </main>
        
           <!-- STATE 1: PUBLISHED STORY SUCCESS -->
    <template v-if="isPublished">

       <footer class="studio-modal__footer">

           <button
            class="btn btn--primary"
            @click="handleNextUpdate('preview')"
          >
            Preview
          </button>
          <button
            class="btn btn--secondary"
            @click="router.push(`/tale/${activeTale?.slug}`)"
          >
            Live
          </button>

      </footer>

    </template>

    <!-- STATE 2: UNPUBLISHED & ALL SECTIONS COMPLETE -->
   <template v-else-if="!isAllRequirementsMet && !isPublished">

        <footer class="studio-modal__footer">

           <button
            v-if="nextIncompleteSection"
            class="btn btn--primary"
            @click="handleNextUpdate(nextIncompleteSection.section)"
          >
            {{ nextIncompleteSection.label.split(' ')[0] }}
          </button>

          <button
            class="btn btn--secondary"
            @click="handleNextUpdate('details')"
          >
            Preview
          </button>

      </footer>

    </template>

      <!-- STATE 4: UNPUBLISHED & NO PHOTO -->
    <template v-else-if="isAllRequirementsMet && !isPublished && !taleStore.hasPhoto">

       <footer class="studio-modal__footer">

          <button
            class="btn btn--primary"
            @click="handleNextUpdate('photo')"
          >
            Photo
          </button>

          <button
            class="btn btn--secondary"
            @click="handleNextUpdate('publish')"
          >
            Publish
          </button>

      </footer>
    
    </template>

    <!-- STATE 3: UNPUBLISHED & INCOMPLETE SECTIONS REMAIN -->
    <template v-else-if="isAllRequirementsMet && !isPublished">

       <footer class="studio-modal__footer">

          <button
            class="btn btn--primary"
            @click="handleNextUpdate('preview')"
          >
            Preview
          </button>

          <button
            class="btn btn--secondary"
            @click="handleNextUpdate('publish')"
          >
            Publish
          </button>

      </footer>

    </template>

      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/css/editor-modal.less";
</style>