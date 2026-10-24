<script setup lang="ts">
import { type TaleDraftListDto } from '../types/TalesTypes';
import { TaleStatusDescriptions } from '@/utils/descriptors'
import { toRelativeTime } from '@/utils/dateExtensions'
import { useTaleDraftStore } from '../stores/TaleDraftStore';

const taleStore = useTaleDraftStore();

function handleSelectCard() {
  // 1. Set the clicked draft as the active tale in Pinia store
  taleStore.setActiveTale(props.tale)
  
  // 2. Notify EditorLayout to switch currentAsideView to 'detail'
  taleStore.setCurrentAsideView('detail')
}

// Declare compile-time parameter contract boundaries
interface Props {
  tale: TaleDraftListDto
}

const props = defineProps<Props>()

</script>

<template>

<article 
    class="draft-list-card"
    :class="{ 'draft-list-card--active': taleStore.activeTale?.taleId === tale.taleId }"
    tabindex="0"
    @click="handleSelectCard"
    @keydown.enter.prevent="handleSelectCard"
    @keydown.space.prevent="handleSelectCard">

      <h2 class="draft-list-card__title">
       {{ tale.title }}
      </h2>


     <div class="draft-list-card__meta">
       
            <span>
            {{ TaleStatusDescriptions[tale.status] }}
            </span>
            <span class="divider divider--line"></span>
        <time class="draft-list-card__date">{{ toRelativeTime(tale.createdAt) }}</time>
      </div>

    
  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/draft-list-card.less";
</style>