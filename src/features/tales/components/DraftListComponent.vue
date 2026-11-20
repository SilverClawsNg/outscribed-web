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
@import "@/assets/css/variables.less";

.draft-list-card {
  width: 100%;
  height: auto;
  padding: 0.5rem;
  //box-shadow: var(--box-shadow);
  border:1px solid var(--border-color);
  margin-bottom: 0.5rem;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
  user-select: none;
  background-color: var(--background-color);
  border-radius: 4px;

 
 padding: 1rem;

&:hover {
    background-color: var(--hover-background-color);
    border-color: var(--surface-border-color);
  }

  
  &--active {
     background-color: var(--hover-background-color);
  }

  
  &__meta {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    z-index: 10;
 font-size: 0.85rem;
   
 }

  &__title {
    font-size: 1.2rem;
    line-height:1.6rem;
    text-transform: capitalize;
    font-weight: normal;
    margin-bottom: 0.5rem;
  }


}
</style>