
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
  <article class="timeline-details__card">
    <section class="timeline-details__metadata">
      <p class="timeline-details__date">— {{ toTimelineDate(timeline.happenedAt) }}</p>
      
      <h2 :class="['timeline-details__type', contentTypeClass]">
        <RouterLink :to="`/timeline?content=${timeline.contentType}`">
          {{ ContentTypeDescriptions[timeline.contentType] || timeline.contentType }}
        </RouterLink>
      </h2>
    </section>

    <section class="timeline-details__text">
      <TimelineActivityDispatcher 
        :timeline="timeline" 
        @open-profile="emitOpenProfile" 
      />
    </section>
  </article>
</template>


<style lang="less" scoped>
@import "@/assets/css/timeline.less";
</style>