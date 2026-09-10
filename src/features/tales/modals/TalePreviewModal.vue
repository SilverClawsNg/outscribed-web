<script setup lang="ts">
import { ref, onBeforeMount} from 'vue';
import { useModalStore } from '@/stores/modalStore';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore';
import { type TaleDraftListDto } from '../types/TalesTypes';
import { toRelativeTime, toShortDate } from '@/utils/dateExtensions'
import { calculateReadingTime } from '@/utils/readingTimeHelper';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'
import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import SvgIcons from '@/components/SvgIcons.vue'

// 2. State & Store Injections
const modalStore = useModalStore();
const authStore = useAuthStore();
const showExternalLink = ref<boolean>(false);
const taleStore = useTaleDraftStore()

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!taleStore.activeTale) {
    // 1. Lock down the form immediately to block accidental click updates
   
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

})

</script>

<template>

  <template v-if="!taleStore.activeTale">
    <PageStatusMessage 
      title="204: Content Unavailable!" 
      message="Unable to load current tale details. Refresh page and try again">
    </PageStatusMessage>
  </template>

    <template v-else>
  
  <article class="content-details">
    
     <header class="content-details__header-container">
      <div class="content-details__header">
        <h1 class="content-details__title">{{ taleStore.activeTale.title }}</h1>

        <div class="content-details__writer">
          By 
          <button 
          type="button"
            class="content-details__writer-link at" 
            @click="modalStore.push('Profile', 'Profile', authStore.userId)"
          >
            {{ authStore.username }}
          </button>
           — <time>{{ toShortDate(taleStore.activeTale.createdAt) }}</time>
        </div>

       <div class="content-details__meta">
        
          <div class="content-details__meta-item">
           <SvgIcons name='tag' /> 
            <router-link 
              class="content-details__category" 
              :to="`/tales?category=${taleStore.activeTale.category}`"
            >
             {{ CategoryDescriptions[taleStore.activeTale.category] }}
            </router-link>
          </div>

          <template  v-if="taleStore.activeTale.country">

           <div class="content-details__meta-item">
             <SvgIcons name='globe' />
            <router-link 
              class="content-details__country" 
              :to="`/tales?country=${taleStore.activeTale.country}`"
            >
              {{ CountryDescriptions[taleStore.activeTale.country] }}            
            </router-link>
          </div>
          </template>

        </div>

          <template v-if="taleStore.activeTale.summary">
              <p class="content-details__summary">
          
           {{ taleStore.activeTale.summary }}
              </p>
              
            </template>
            <template v-else >
                   <p class="content-details__no-content">Summary goes here!</p>
            </template>
      
      </div>
    </header>  

    <div class="content-details__main">
     
     <template v-if="taleStore.activeTale.photo">
 <figure class="content-details__media">
        <img 
        :src="mediaHelper.getUrl(taleStore.activeTale.photo, 'tales', 'full')" 
        :alt="taleStore.activeTale.photoCaption ?? 'photo caption goes here'"
         class="content-details__image" />
        <figcaption class="content-details__caption">
          {{ taleStore.activeTale.photoCaption }}
        </figcaption>
      </figure>
        </template>
        <template v-else >
                   <p class="content-details__no-content">Central image goes here!</p>
            </template>

       <template v-if="taleStore.activeTale.detail">
 <p class="content-details__reading-time">
          — {{ calculateReadingTime(taleStore.activeTale.detail) }} Minutes Read
 </p>

        <div class="shared__rich-text" v-html="taleStore.activeTale.detail"></div>
        </template>
         <template v-else>
             <p class="content-details__reading-time">
          — 0 Minutes Read
             </p>

        <p class="content-details__no-content">Detail goes here!</p>
        </template>
    
       <template v-if="taleStore.activeTale.addendum && taleStore.activeTale.addendumDate">
 <div class="content-details__addendum">
        <h4 class="content-details__section-title">Addendum - Last Updated {{ toShortDate(taleStore.activeTale.addendumDate) }}</h4>
        <ol class="content-details__addendum-list">
          <li v-for="(entry, index) in formatAddendum(taleStore.activeTale.addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </div>
        </template>

       <template v-if="taleStore.activeTale.realityCheckTitle">
   <div class="content-details__realitycheck">
       <h2 class="content-details__realitycheck-heading">Reality Check
          <span>✓</span>
        </h2>

          <h3 class="content-details__realitycheck-title">
           {{ taleStore.activeTale.realityCheckTitle }}
        </h3>
    
         <div class="content-details__realitycheck-body">
            <p>
            <span class="content-details__realitycheck-source">{{ taleStore.activeTale.realityCheckSource }}</span> -
            {{ taleStore.activeTale.realityCheckSummary }}
          </p>

            <div class="content-details__realitycheck-actions">
            <button type="button" class="btn secondary" @click="showExternalLink = !showExternalLink">
              Visit Source
            </button>
          </div>

          <div v-if="showExternalLink" class="shared__popover">
            <div class="shared__popover-arrow"></div>
            <p class="shared__popover-text">You would be redirected to {{ taleStore.activeTale.realityCheckUrl }}</p>
            <div class="shared__popover-actions">
              <a 
                :href="taleStore.activeTale.realityCheckUrl ?? '#'" 
                target="_blank" 
                @click="showExternalLink = false">
                Yes
              </a>
              <button class="btn-cancel" @click="showExternalLink = false">No</button>
            </div>
          </div>
        </div>
      </div>
        </template>
          <template v-else >
                   <p class="content-details__no-content">Reality check goes here!</p>
            </template>

       <template  v-if="taleStore.activeTale.tags && taleStore.activeTale.tags.length > 0">
  <div class="content-details__tags">
        <h4>Tagged In: </h4><span class="divider line"></span>
        <span v-for="tag in taleStore.activeTale.tags" :key="tag.tagId">
          #<router-link :to="`/tales/browse?tag=${tag.tagId}`">{{ tag.name }}</router-link>
        </span>
      </div>
        </template>
        <template v-else >
                   <p class="content-details__no-content">Tags goes here!</p>
            </template>
    
      </div>
  </article>
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
@import "@/assets/css/rich-text.less";
</style>