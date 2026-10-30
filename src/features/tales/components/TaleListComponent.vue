<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';

import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type TaleListDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

interface Props {
  tale: TaleListDto,
  isHomepage?: boolean
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement));

const contentType = 'tales'
const contentPath = 'tale'

</script>

<template>

  <article class="content-card">
    <!-- Cover Image Header -->
     
    <!-- Content Body -->
        <!-- Taxonomy Metadata -->
    

      <!-- Title -->
      <h2 class="content-card__title">
        <RouterLink :to="`/${contentPath}/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h2>
 
      <!-- Summary -->
      <p class="content-card__summary">
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
      </p>

      <div class="content-card__meta">
        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
        <span class="divider divider--circle"></span>
        <time class="content-card__date">{{ toRelativeTime(tale.createdAt) }}</time>
      </div>
      
            
       <template v-if="tale.photo">
          <RouterLink class="content-card__media-link" :to="`/${contentPath}/${tale.slug}`">
              <img 
            :src="mediaHelper.getUrl(tale.photo, contentType, 'thumb') || undefined" 
            :alt="tale.title" 
            class="content-card__image"
          />
          </RouterLink>
       </template>
       
        <div class="content-card__taxonomy">
        <RouterLink :to="`/${contentType}?category=${tale.category}`" class="content-card__taxonomy-item">
          {{ CategoryDescriptions[tale.category] }}
        </RouterLink>
        
         <RouterLink :to="`/${contentType}?country=${tale.country}`" class="content-card__taxonomy-item">
            {{ CountryDescriptions[tale.country] }}
          </RouterLink>
      </div>

      <!-- Engagement Metrics -->
      <div class="content-card__stats">
        <p class="content-card__stat"><span>{{ tale.readingTime }}</span> Min Read</p>
         <template v-if="!isHomepage">
         <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.commentsCount) }}</span> Comments</p>

        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.viewsCount) }}</span> Views</p>
        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.upvotesCount) }}</span> Upvotes</p>
        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.favoritesCount) }}</span> Saves</p>
        </template>
       
      </div>

    <!-- Actions Footer -->
    <footer class="content-card__footer">
      <RouterLink class="btn btn--secondary"  :to="`/${contentPath}/${tale.slug}`">View Tale</RouterLink>
      
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(tale.engagement)"
        :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled"
      >
        <SvgIcons name="bookmark" /> 
        <span>{{ uiMeta.favoriteLongText }}</span>
      </button>
    </footer>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.content-card {
  width: 100%;
  height: auto;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &__media-link {
   display: block;
   width: 100%;
    height: 250px;
    margin-bottom: 1rem;
    background-color: var(--light-background-color);
    overflow: hidden;
    border-radius: 4px;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }
  
  &__meta{
    display: flex;
    align-items: center;
    //justify-content:center;
    column-gap: 0.5rem;
    z-index: 10;
    margin-bottom: 1rem;
    }

  // --- Card Content Body ---
  &__body {
    display: flex;
    flex-direction: column;
  }

    &__title {
      //text-align: center;
      font-size: clamp(1.4rem, 5vw, 1.8rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
      font-weight:normal;
    }
     
    &__summary {
      font-size: clamp(0.95rem, 5vw, 1.1rem);
      margin-bottom: 1rem;
      //text-align: center;
      color: var(--muted-text-color);
    }


  // --- Metrics ---
  &__stats {
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    //justify-content:center;
    gap: 0.25rem 0.75rem;
    //font-size: 0.9rem;
    
  }

  &__stat {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;

    span {
      font-weight: 600;
    }
  }


&__taxonomy {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    //justify-content:center;
    margin-bottom: 1rem;
}
       
  &__taxonomy-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    color: var(--muted-text-color);
    //color:@link-color;
    border-radius: 99999px;
    font-size: 0.9rem;
    font-weight: 600;

     &:hover {
          background-color: var(--light-background-color);
        }
      }

  // --- Footer Actions ---
  &__footer {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    //justify-content:center;
  }

  &__save-btn {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    height: 40px;
  }
}
</style>
