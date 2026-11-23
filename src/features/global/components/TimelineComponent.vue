
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { TimelineDto } from '../types/GlobalTypes' // Ensure this path points to your interfaces
import { toTimelineDate } from '@/utils/dateExtensions'
import { ContentTypeDescriptions } from '@/utils/descriptors'
import { TimelineActivityDispatcher } from '@/features/global/types/TimelineActivityDispatcher'

// Declare compile-time parameter contract boundaries
interface Props {
  timeline: TimelineDto
}

const props = defineProps<Props>()

// Setup strict emission mapping for parental relay chains (e.g., opening modals)
const emit = defineEmits<{
  (e: 'open-profile', actorId: string): void
}>()

const emitOpenProfile = (actorId: string) => {
  emit('open-profile', actorId)
}

// -------------------------------------------------------------------------
// Computed Presentation Mappings
// -------------------------------------------------------------------------

const contentTypeClass = computed(() => {
  return props.timeline.contentType 
    ? props.timeline.contentType.toString().toLowerCase() 
    : 'unknown'
})

</script>
<template>
  <article class="timeline-card">
    <section class="timeline-card__metadata">
      <p class="timeline-card__date"> — {{ toTimelineDate(timeline.happenedAt) }}</p>
      
      <RouterLink 
          :to="`/timelines?contenttype=${timeline.contentType.toLowerCase()}`" 
          class="timeline-card__type"
          :class="['timeline-card__type', contentTypeClass ? `timeline-card__type--${contentTypeClass}` : '']"
        >
          {{ ContentTypeDescriptions[timeline.contentType] || timeline.contentType }}
        </RouterLink>
    </section>

     <TimelineActivityDispatcher 
        :timeline="timeline" 
        @open-profile="emitOpenProfile" 
      />
  
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.timeline-card {
  padding: 1.5rem 0.5rem;
  width: 100%;
  height: auto;
  border-bottom: 1px solid var(--border-color);
 
  &__metadata {
    height: auto;
    display: flex;
    margin-bottom: 1rem;
    gap: 0.5rem;
    justify-content: space-between;

  }


  &__date {
    text-transform: capitalize;
    font-size: 0.9rem;
    color: var(--muted-text-color);
    
  }
 
      &__type{
         display: inline-block;
          padding: 1px 2px;
          border-radius: 4px;
          border: 1px solid var(--surface-border-color);
          background-color: var(--surface-background-color);
          font-size: 0.725rem;
          font-weight: 600;
          text-transform: uppercase;
          transition: opacity 0.2s ease;
    &:hover {
      opacity: 0.85;
    }

      }

   

}
</style>