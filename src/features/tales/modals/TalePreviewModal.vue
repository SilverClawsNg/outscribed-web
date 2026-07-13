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

const unavailable = ref<boolean>(false);

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!taleStore.activeTale) {
    // 1. Lock down the form immediately to block accidental click updates
    
   unavailable.value = true
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

})

</script>

<template>

  <template v-if="unavailable">
    <PageStatusMessage 
      title="204: Content Unavailable!" 
      message="Unable to load current tale details. Refresh page and try again">
    </PageStatusMessage>
  </template>

    <template v-else>
  
  <article class="content-details">
    
    <section class="content-details__header-container">
      <div class="content-details__header">
        <h1 class="content-details__title">{{ taleStore.activeTale!.title }}</h1>

        <div class="content-details__metadata-writer">
          By 
          <button 
            class="at" 
            @click="modalStore.push('Profile', 'Profile', authStore.userId)"
          >
            {{ authStore.username }}
          </button>
        </div>

        <section class="content-details__metadata">
          <div class="content-details__metadata-date">
            <SvgIcons name='clock' /> {{ toShortDate(taleStore.activeTale!.createdAt) }}
          </div>

          <div class="content-details__metadata-category">
           <SvgIcons name='tag' /> 
            <router-link 
              class="content-details__category" 
              :to="`/tales?category=${taleStore.activeTale!.category}`"
            >
             {{ CategoryDescriptions[taleStore.activeTale!.category] }}
            </router-link>
          </div>

          <template  v-if="taleStore.activeTale!.country">

          <div class="content-details__metadata-country">
             <SvgIcons name='globe' />
            <router-link 
              class="content-details__country" 
              :to="`/tales?country=${taleStore.activeTale!.country}`"
            >
              {{ CountryDescriptions[taleStore.activeTale!.country] }}            
            </router-link>
          </div>
          </template>

        </section>

          <template v-if="taleStore.activeTale!.summary">
              <section class="content-details__summary">
          
           {{ taleStore.activeTale!.summary }}
        </section>
              
            </template>
             <template v-else >
                  <section class="content-details__summary">
                          <p class="no-content">Summary goes here!</p>
        
        </section>
            </template>
      
      </div>
    </section>  

    <section class="content-details__main-container">
     
     <template v-if="taleStore.activeTale!.photo">
 <figure class="content-details__image">
        <img :src="mediaHelper.getUrl(taleStore.activeTale!.photo, 'tales', 'full')" :alt="taleStore.activeTale!.photoCaption ?? 'photo caption goes here'" />
        <figcaption class="content-details__image-caption">
          {{ taleStore.activeTale!.photoCaption }}
        </figcaption>
      </figure>
        </template>
         <template v-else>
                                 <p class="no-content">Your central image goes here!</p>

        </template>

       <template v-if="taleStore.activeTale!.detail">
 <section class="content-details__reading-time">
          — {{ calculateReadingTime(taleStore.activeTale!.detail) }} Minutes Read
        </section>

        <section class="content-details__text" v-html="taleStore.activeTale!.detail"></section>
        </template>
         <template v-else>
             <section class="content-details__reading-time">
          — 0 Minutes Read
        </section>

        <section class="content-details__text">
                  <p class="no-content">Detail goes here!</p>

        </section>
        </template>
    
       <template v-if="taleStore.activeTale!.addendum && taleStore.activeTale!.addendumDate">
 <section class="content-details__addendum">
        <h4>Addendum - Last Updated {{ toShortDate(taleStore.activeTale!.addendumDate) }}</h4>
        <ol>
          <li v-for="(addendum, index) in formatAddendum(taleStore.activeTale!.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </section>
        </template>
       

       <template v-if="taleStore.activeTale!.watchlistTitle">
   <section class="content-details__watchlist">
       
        <h2 class="content-details__watchlist-source">
         / fact check / {{ taleStore.activeTale!.watchlistSource }}
        </h2>
  <h3 class="content-details__watchlist-title">
          {{ taleStore.activeTale!.watchlistTitle }}
        </h3>
        <div class="content-details__watchlist-summary">
          {{ taleStore.activeTale!.watchlistSummary }}
          <button @click="showExternalLink = !showExternalLink">...Continue Reading</button>
          
          <div v-if="showExternalLink" class="shared__popover">
            <div class="shared__popover-arrow"></div>
            <p class="shared__popover-text">You would be redirected to {{ taleStore.activeTale!.watchlistUrl }}</p>
            <div class="shared__popover-actions">
              <a 
                :href="taleStore.activeTale!.watchlistUrl ?? '#'" 
                target="_blank" 
                class="content-details__watchlist-action"
                @click="showExternalLink = false">
                Yes
              </a>
              <button class="btn-cancel" @click="showExternalLink = false">No</button>
            </div>
          </div>
        </div>
      </section>
        </template>
         <template v-else>
               <section class="content-details__watchlist">
       
      <p class="no-content">Your watchlist goes here!</p>

      </section>
        </template>
   

       <template  v-if="taleStore.activeTale!.tags && taleStore.activeTale!.tags.length > 0">
  <section class="content-details__tags">
        <h4>Tagged In: </h4><span class="divider line"></span>
        <span v-for="tag in taleStore.activeTale!.tags" :key="tag.tagId">
          #<router-link :to="`/tales/browse?tag=${tag.tagId}`">{{ tag.name }}</router-link>
        </span>
      </section>
        </template>
         <template v-else>
              <section class="content-details__tags">
                       <p class="no-content">Your tags goes here!</p>

      </section>
        </template>
    

    </section>
  </article>
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
</style>