<template>
  <section class="shared__end-of-file">
    <div id="scroll-sentinel"></div>

    <div v-if="errorMessage || errorTitle" class="shared__error-container">
      <div class="shared__error">
        <h4>{{ errorTitle || 'Pagination Error' }}</h4>
        <p>{{ errorMessage }}</p>
      </div>
      <button class="btn primary" @click="emitRetry">
        Retry
      </button>
    </div>

    <p v-else-if="shouldInfiniteScroll" class="shared__loader"></p>

    <p v-else class="shared__loaded"></p>
  </section>
</template>

<script setup lang="ts">
// Define strict compile-time type boundaries for parameters
interface Props {
  shouldInfiniteScroll: boolean
  errorTitle: string | null
  errorMessage: string | null
}

// Instantiate props macro with full strict typing
defineProps<Props>()

// Instantiate structured emission mappings for callbacks
const emit = defineEmits<{
  (e: 'retry'): void
}>()

const emitRetry = () => {
  emit('retry')
}
</script>