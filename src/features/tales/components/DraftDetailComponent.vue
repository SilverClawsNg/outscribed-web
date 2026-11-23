<script setup lang="ts">
import { computed } from 'vue'
import { useTaleDraftStore, type MainCanvasView } from '../stores/TaleDraftStore'
import { TaleStatusClass, TaleStatusDescriptions } from '@/utils/descriptors';
import type { TaleDraftListDto } from '../types/TalesTypes';
import PageStatusMessage from '@/components/PageStatusMessage.vue';
import SvgIcons from '@/components/SvgIcons.vue'
import { toLongDate } from '@/utils/dateExtensions'

const taleStore = useTaleDraftStore()
// Assert the non-null type when safe behind v-if in the template
const activeTale = computed(() => taleStore.activeTale as TaleDraftListDto)

</script>

<template>
         
        <template v-if="taleStore.isInitializing">

            <div class="loader" role="status" aria-label="Initializing">
            <p class="loader__dot"></p>
            </div>

        </template>

  <template v-else-if="taleStore.activeTale">
    
  <div class="draft-detail">

    <div class="draft-detail__header">

      <div class="draft-detail__header-meta">
           <div class="content-status">
            <span class="content-status__label">Status</span>
            <span 
              class="content-status__value" 
              :class="`content-status__value--${TaleStatusClass[activeTale.status]}`"
            >
            {{ TaleStatusDescriptions[activeTale.status] }}
            </span>
          </div>
        <time class="draft-list-card__date">{{ toLongDate(activeTale.createdAt) }}</time>
      </div>
    
      <h3 class="draft-detail__title">{{ activeTale.title }}</h3>

    </div>

    <div class="divider-multi divider-multi--link"><span></span></div>

    <!-- 3 Core Section Buttons -->
    <div class="draft-detail__menu">

      <button 
        type="button" 
        class="draft-detail__item"
        :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'basic' }"
       @click="taleStore.setCurrentMainView('basic')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="metadata" :size="25" />
           <h4 class="draft-detail__item-title">Basic Information</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="taleStore.hasBasicInfo()"  class="form-message-icon">✓</span>
        </div>
      </button>

        <button 
        type="button" 
        class="draft-detail__item"
        :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'details' }"
        @click="taleStore.setCurrentMainView('details')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="details" :size="25" />
           <h4 class="draft-detail__item-title">Story Details</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="taleStore.hasDetails()"  class="form-message-icon">✓</span>
        </div>
      </button>

        <button 
        type="button" 
        class="draft-detail__item"
        :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'reality' }"
        @click="taleStore.setCurrentMainView('reality')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="check" :size="25" />
          <h4 class="draft-detail__item-title">Reality Check</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="taleStore.hasRealityCheck()"  class="form-message-icon">✓</span>
        </div>
      </button>
      
        <button 
        type="button" 
        class="draft-detail__item"
        :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'photo' }"
        @click="taleStore.setCurrentMainView('photo')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="placeholder" :size="25" />
          <h4 class="draft-detail__item-title">Cover Photo (optional)</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="taleStore.hasPhoto()"  class="form-message-icon">✓</span>
        </div>
      </button>

       <div class="divider-multi divider-multi--link"><span></span></div>

         <button 
        type="button" 
        class="draft-detail__item"
         :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'preview' }"
        @click="taleStore.setCurrentMainView('preview')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="preview" :size="25" />
           <h4 class="draft-detail__item-title">Preview Story</h4>
        </div>
        <div class="draft-detail__item-check">
          
        </div>
      </button>
        <template v-if="taleStore.activeTale?.status === 'Created'">
      
        <button 
        type="button" 
        class="draft-detail__item"
        :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'publish' }"
        @click="taleStore.setCurrentMainView('publish')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="publish" :size="25" />
          <h4 class="draft-detail__item-title">Publish</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="!taleStore.CannotPublish()"  class="form-message-icon">✓</span>
        </div>
      </button>

    </template>
    <template v-else>

      <RouterLink 
       :to="`/tale/${taleStore.activeTale.slug}`"
       target="_blank" 
       class="draft-detail__item"
        rel="noopener noreferrer"
        title="Open live story in a new tab">
          <div class="draft-detail__item-meta">
          <SvgIcons name="live" :size="25" />
          <h4 class="draft-detail__item-title">View Live Story</h4>
        </div>
        <div class="draft-detail__item-check">
          <span class="form-message-icon">✓</span>
        </div>
      </RouterLink>
    
    </template>


       <div class="divider-multi divider-multi--link"><span></span></div>

        <button 
        type="button" 
        class="draft-detail__item"
        :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'tags' }"
       @click="taleStore.setCurrentMainView('tags')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="tag" :size="25" />
           <h4 class="draft-detail__item-title">Tags</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="taleStore.hasTags()"  class="form-message-icon">✓</span>
        </div>
      </button>

       <button 
        type="button" 
        class="draft-detail__item"
          :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'addendum' }"
        @click="taleStore.setCurrentMainView('addendum')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="addendum" :size="25" />
           <h4 class="draft-detail__item-title">Add Addendum</h4>
        </div>
        <div class="draft-detail__item-check">
          <span v-if="taleStore.hasAddendum()"  class="form-message-icon">✓</span>
        </div>
      </button>

        <button 
        type="button" 
        class="draft-detail__item"
         :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'metrics' }"
        @click="taleStore.setCurrentMainView('metrics')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="stats" :size="25" />
           <h4 class="draft-detail__item-title">View Daily Metrics</h4>
        </div>
        <div class="draft-detail__item-check">
          
        </div>
      </button>

       <div class="divider-multi divider-multi--link"><span></span></div>

         <button 
        type="button" 
        class="draft-detail__item"
         :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'help' }"
        @click="taleStore.setCurrentMainView('help')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="help" :size="25" />
           <h4 class="draft-detail__item-title">Help Topics</h4>
        </div>
        <div class="draft-detail__item-check">
          
        </div>
      </button>

    <template v-if="taleStore.activeTale?.status == 'Created'">

      <button 
        type="button" 
        class="draft-detail__item"
         :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'delete' }"
        @click="taleStore.setCurrentMainView('delete')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="trash" :size="25" />
           <h4 class="draft-detail__item-title">Delete Draft</h4>
        </div>
        <div class="draft-detail__item-check"></div>
      </button>

    </template>

    <template v-else-if="taleStore.activeTale?.status == 'CertifiedToArchivedByCreator' || taleStore.activeTale?.status == 'LaunchedToArchivedByCreator'">
       <button 
        type="button" 
        class="draft-detail__item"
          :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'unarchive' }"
        @click="taleStore.setCurrentMainView('unarchive')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="unarchive" :size="25" />
           <h4 class="draft-detail__item-title">Unarchive Tale</h4>
        </div>
        <div class="draft-detail__item-check"></div>
      </button>
    </template>

    <template v-else>
       <button 
        type="button" 
        class="draft-detail__item"
          :class="{ 'draft-detail__item--active': taleStore.currentMainView === 'archive' }"
        @click="taleStore.setCurrentMainView('archive')"
      >
        <div class="draft-detail__item-meta">
          <SvgIcons name="archive" :size="25" />
           <h4 class="draft-detail__item-title">Archive Tale</h4>
        </div>
        <div class="draft-detail__item-check"></div>
      </button>
    </template>
   
    </div>
  </div>
  </template>
  
  <template v-else>
    <PageStatusMessage 
      title="Draft Not Found!" 
      message="Error occured displaying the current draft. Refresh page and try again"
      icon="inbox"
      :is-standalone="true" />
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.draft-detail {
  width: 100%;
  height: auto;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  background-color: @link-background-color;
  color: @white-color;

 &__header-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 0.5rem;
    z-index: 10;
    margin-bottom: 0.5rem;

      & .content-status{
        margin-bottom: 0;
    }

    & time{
        font-size: 0.85rem;
        color: @white-color;
    }
}

  &__header {
    padding: 1rem 0.5rem;
    //border-bottom: 1px solid var(--border-color);
    }

  &__title {
   font-size: clamp(1.25rem, 1.5vw + 0.875rem, 1.5rem); // Fluid title scaling
    line-height: @line-height-tight;
    text-transform: capitalize;
    padding: 0.5rem 0;
    font-weight: normal;
    color: @white-color;
  }

  
&__menu{
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 0.25rem;
}

  &__item{
    border-radius: 8px;
    background-color: @link-color;
    border: 2px solid @link-border-color;
    display: flex;
    align-items:center;
    justify-content: space-between;
    width: 100%;
    height: 60px;
     column-gap: 0.5rem;
    
    padding: 0 0.75rem;
    color: @white-color;
    
    &:hover {
     opacity: 0.65;
    }

      &--active {
     background-color: @white-color;
     color: @link-color;
      pointer-events:none;

      .draft-detail__item-title{
         color: @link-color;
      }
      }

    & svg{
      stroke-width: 2;
    }

  }

   &__item-meta{
    display: flex;
    align-items:center;
    column-gap:0.25rem;
    color: inherit;
  }

   &__item-title{
    color: @white-color;
  }

  .form-message-icon{
     color: @white-color;
  }




}
</style>