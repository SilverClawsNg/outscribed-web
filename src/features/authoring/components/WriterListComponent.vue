<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';

import { toShortDate } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type WriterListDto } from '../types/AuthoringTypes';
import { CountryDescriptions } from '@/utils/descriptors'
import Content from '@/components/Content.vue'
import WriterStats from '@/components/WriterStats.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { formatCounts } from '@/utils/stringHelpers'

// Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

// Declare compile-time parameter contract boundaries
interface Props {
  writer: WriterListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.writer.creator.engagement));

</script>

<template>
  
  <article class="writer-card">
    <!-- Writer Identity & Profile Section -->
    <header class="writer-card__header">

      
      <div class="writer-card__meta">
     

        <div class="writer-card__title">
           <button 
          type="button" 
          class="writer-card__title--username" 
          title="Creator Profile" 
          @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
        >
          @{{ writer.creator.username }}
        </button>

            <time class="writer-card__title--time"><span>OutScribing </span>since {{ toShortDate(writer.onboardedAt) }}</time>
        </div>
        
      </div>
  
        <button 
          type="button" 
          class="btn btn--secondary"
          :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
          :disabled="uiMeta.isFavoriteDisabled"
          @click="engage.favorite(writer.creator.engagement)"
        >
         {{ uiMeta.favoriteAltText }}
        </button>

    </header>

    
    <div class="writer-card__metric">
      <RouterLink 
        :to="`/tales?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
         :class="{ 'disabled': writer.creator.talesCount === 0 }"
        title="Filter Tales"
      >
        <span class="writer-card__metric-value"> {{ formatCounts(writer.creator.talesCount) }}</span>
        <span class="writer-card__metric-label"> Tales&rarr;</span>
      </RouterLink>

      <span class="divider divider--line"></span>

      <RouterLink 
        :to="`/comments?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
        :class="{ 'disabled': writer.creator.commentsCount === 0 }"
        title="Filter Comments"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.commentsCount) }}</span>
        <span class="writer-card__metric-label"> Comments&rarr;</span>
      </RouterLink>

    </div>

  <div class="divider-multi"><span></span></div>

    <!-- Writer's Latest Featured Content -->
  
       <template v-if="writer.latestTale">

      <RouterLink :to="`/tale/${writer.latestTale.slug}`"  class="writer-card__latest">

           <h1  class="writer-card__latest--title">
            {{ writer.latestTale.title }}
            </h1>

             <time class="writer-card__latest--date">{{toShortDate(writer.latestTale.createdAt)}}</time>

             <p class="writer-card__latest--summary">
              {{ writer.latestTale.summary.length > 500 ? writer.latestTale.summary.substring(0, 500) + '...' : writer.latestTale.summary }}
            </p>
              
      </RouterLink>

       </template>

      <template v-else>
          <PageStatusMessage 
              title="No Published Tale!" 
              message="We could not retrieve the latest tale for this writer."
              icon="broken-chain" 
            />
      </template>
   
  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.writer-card {
  position: relative;
  width: 100%;
  height: auto;
  padding: 1.5rem 0;
  border-bottom: 2px solid var(--border-color);
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }


  &__meta {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    
  }

  &__title{
    display: flex;
    flex-direction:column;
    align-items:flex-start;

    &--username{
      font-size: 1.25rem;
      }

      &--time{
        font-size: 0.875rem;

        & span{
          font-style: italic;
        }
  
      }
  }

  
&__latest {
  width: 100%;
  height: auto;
  padding: 1.5rem 0.5rem;
  display: flex;
 flex-direction: column;
 row-gap: 0.75rem;
 border: 1px solid var(--border-color);
 border-radius: 12px;
 

 &:hover{
  background-color:var(--light-background-color);
  color: var(--text-color);
  
 }

   &--title {
    font-size: 1.2rem;
    line-height: 1.35;
    text-transform: capitalize;
  }

  &--date {
    font-size: 0.9rem;
  }

  
  &--summary {
    line-height: 1.5;
  }


}

}
</style>