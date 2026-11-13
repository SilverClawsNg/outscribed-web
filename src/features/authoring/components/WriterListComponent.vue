<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import { useEngagement } from '@/composables/useEngagement';

import { toRelativeTime, toShortDate } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type WriterListDto } from '../types/AuthoringTypes';
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

      <div class="user-card">

          <h3 class="user-card__title">

          <button 
            type="button"
            class="user-card__title--username at" 
            @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
          >
            {{ writer.creator.username }}
          </button>

          </h3>

          <time class="user-card__date""><span>OutScribing </span>since {{ toShortDate(writer.onboardedAt) }}</time>

              <div class="user-card__actions">

                    <button 
                        type="button" 
                        class="btn btn--primary btn--primary-white"
                        :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                        :disabled="uiMeta.isFavoriteDisabled"
                        @click="engage.favorite(writer.creator.engagement)"
                      >
                      {{ uiMeta.favoriteAltText }}
                      </button>
                     <RouterLink 
                        :to="`/tales?username=${writer.creator.username}`" 
                       class="user-card__metric-link"
                        :class="{ 'disabled': writer.creator.talesCount === 0 }"
                        title="Filter Tales"
                      >
                        <span class="user-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
                        <span class="user-card__metric-label">Tales&rarr;</span>
                      </RouterLink>

              </div>

      </div>

      <template v-if="writer.latestTale">

      <div class="tale-card">

           <h3 class="tale-card__title">
        <RouterLink :to="`/tale/${writer.latestTale.slug}`">{{ writer.latestTale.title }}</RouterLink>
      </h3>
      <p class="tale-card__summary">
        {{ writer.latestTale.summary.length > 500 ? writer.latestTale.summary.substring(0, 500) + '...' : writer.latestTale.summary }}
      </p>
        <div class="tale-card__meta">
            
            <time>{{ toRelativeTime(writer.latestTale.createdAt) }}</time>
           
          </div>
            <footer class="tale-card__footer">
            <RouterLink  class="tale-card__footer--read" :to="`/tale/${writer.latestTale.slug}`">Read&rarr;</RouterLink>
           
          </footer>

    </div>

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
@import "@/assets/css/user-card.less";

.writer-card {
  width: 100%;
  height: auto;
 border-radius: 21px;
 display: flex;
 flex-direction: column;
 
  .user-card{
      background-color: @link-color;
        border-radius: 21px 21px 0 0;
        background-image: url("@/assets/images/patterns-background.png");
        background-position-x: right;
        background-position-y: bottom;
        background-repeat: no-repeat;
        background-position: contain;
        background-size: 40%;
         color:@white-color;
        width: 100%;
        height: auto;
        padding: 1rem;

        
  &__title {
    margin-bottom: 0.5rem;
    font-weight: 600;
     font-size: 1.5rem;

        & .at:before {
        color: @white-color;
    }

  & button{
    color:@white-color;

    &:hover{
      opacity: 0.8;
    }

  }

  }

  
&__date{
  color:@white-color;
  font-size: 0.9rem;

  & span{
    font-style: italic;
  }
}


  &__metrics {
    display: flex;
    gap: 0.75rem;
    
  }

  &__metric-link {
   display: inline-flex;
    align-items: center;
    column-gap: 0.25rem;
    color:@white-color;
  }

  &__metric-value {
    font-weight: 700;
  }

  &__metric-label {
    font-weight: 400;
    
  }

  &__actions{
    display: flex;
    column-gap: 1rem;
     margin-top: 1.5rem;

  }
  }
    

 .tale-card{
  border: 1px solid var(--border-color);
  border-top: none;
  padding: 1rem 0.5rem;
  border-radius: 0 0 21px 21px;
  flex-grow: 1;
 

  &__title{
    font-weight:700;
    margin-bottom: 0.5rem;
   font-size:1.2rem;
    line-height: 1.4rem;

  }

  &__summary{
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.9rem;
    line-height: 1.5rem;

    &--spaced{
      margin-right: 0.25rem
    }
  }
  
  &__footer {
    display: flex;
    justify-content: flex-start;
    align-items:center;
    column-gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
    font-weight: normal;
     font-size: 0.9rem;
    
  &--read {
     background-color: var(--background-color);
     border:1px solid var(--border-color);
     padding: 0.5rem 0.75rem;
     border-radius: 99999px;
     color: var(--muted-text-color);
     

      &:hover {
        background-color: var(--light-background-color);
        color: @link-color;
      }
    }
  
  }

 }


}



</style>