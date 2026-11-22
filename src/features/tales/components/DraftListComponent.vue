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
       
            <span class="draft-list-card__meta-status">
            {{ TaleStatusDescriptions[tale.status] }}
            </span>
            <span class="divider divider--line"></span>
        <time class="draft-list-card__meta-date">{{ toRelativeTime(tale.createdAt) }}</time>
      </div>

  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

  .draft-list-card{
    border-radius: 8px;
    background-color: @link-color;
    border: 2px solid @link-border-color;
    padding: 0.5rem;
    width: 100%;
    color: @white-color;
    margin-bottom: 0.5rem;
    cursor: pointer;
  user-select: none;
   transition: background-color 0.15s ease, border-color 0.15s ease;

    &:last-child{
      margin-bottom: 0;
    }
    
    &:hover {
      opacity: 0.65;
      color: @white-color;
    }

      &--active {
     background-color: @white-color;
     color: @link-color;
      box-shadow: var(--box-shadow);

      .draft-list-card__title, 
      .draft-list-card__meta-date, 
      .draft-list-card__meta-status{
         color: @link-color;
      }

    
      }
      
  &__meta {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    z-index: 10;
 font-size: 0.85rem;
   
 }

 &__meta-date,
 &__meta-status{
   color: @white-color;
 }

  &__title {
    font-size: 1.2rem;
    line-height:1.6rem;
    text-transform: capitalize;
    font-weight: normal;
    margin-bottom: 0.5rem;
    color: @white-color;
  }

  }


</style>