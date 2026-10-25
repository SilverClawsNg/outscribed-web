<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import { sanitizeHtml } from '@/utils/markupHelper'
import SvgIcons from '@/components/SvgIcons.vue'

const taleStore = useTaleDraftStore()

const error = computed(() => taleStore.activeModalError)

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && error.value) {
    taleStore.closeModal()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

</script>

<template>

  <Transition name="modal-fade">
    
    <div
      v-if="error"
      class="studio-modal-backdrop"
      @click="taleStore.closeModal()"
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
            <span class="studio-modal__badge studio-modal__badge--danger">{{ error.status || 400 }}</span>
            <h2 class="studio-modal__title">{{ error.title || 'Action Blocked' }}</h2>
          </div>

          <button
            type="button"
            class="studio-modal__close"
            aria-label="Close dialog"
            @click="taleStore.closeModal()"
          >
        <SvgIcons name="close" :size="30" />
          </button>
        </header>

        <main class="studio-modal__body">
          <p v-if="error.detail" class="studio-modal__message">
            {{ error.detail }}
          </p>

          <div v-if="error.definition" class="studio-modal__definition-card studio-modal__definition-card--danger">
            <span class="studio-modal__section-label">Problem Definition</span>
            <div
              class="rich-text rich-text--modal"
              v-html="sanitizeHtml(error.definition)"
            ></div>
          </div>
        </main>

      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/css/editor-modal.less";
</style>