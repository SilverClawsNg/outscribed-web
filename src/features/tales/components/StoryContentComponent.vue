<!-- components/story/StoryContent.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import {mediaHelper} from '@/utils/mediaHelper'
import { calculateReadingTime } from '@/utils/readingTimeHelper'
import { sanitizeHtml } from '@/utils/markupHelper';
import type { TagDetailDto, TagDto } from '@/features/global/types/GlobalTypes';
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors';
import type { Category, Country } from '@/utils/enumHelper';
import { toRelativeTime } from '@/utils/dateExtensions';
import { formatAddendum } from '@/utils/stringHelpers';

interface Props {
  title: string
  date: string
  summary: string
  photo: string
  photoCaption?: string | null
  content: string
  readingTime: number
  realityCheckTitle: string
  realityCheckSummary: string
  realityCheckSource?: string | null
  realityCheckUrl?: string | null
  category: Category
  country: Country
  tags?: TagDto[]
  addendum?: string | null
  addendumDate?: string | null
}

const props = defineProps<Props>()

// Resolve photo URL directly from mediaHelper or display static draft placeholder
const photoUrl = computed(() => {
  if (!props.photo) return null
  if (props.photo === '***placeholder***') {
    return '@/assets/images/photo_placeholder.svg'
  }
  return mediaHelper.getUrl(props.photo, 'tales', 'full') || null
})


const showExternalLink = ref(false);
const modalStore = useModalStore()

</script>

<template>
  
    <!-- SECTION 1: HEADER -->
    <header class="story-header">
      <h1 class="story-header__title">{{ title }}</h1>
      <h2 class="story-header__summary">{{ summary }}</h2>
      <div class="story-header__meta">
      <p class="story-header__meta-item">— {{ readingTime }} Minutes Read</p>

      <p class="story-header__meta--item story-header__meta--item--right">
        {{ toRelativeTime(date) }}
      </p>

  </div>
    
    </header>

    <!-- SECTION 2: COVER MEDIA FRAME -->
    <figure v-if="photoUrl || photo ==='***placeholder***'" class="story-media">

         <div class="story-media__frame">

          <template v-if="photo ==='***placeholder***'">
          <div class="story-media__placeholder">
            <SvgIcons name="placeholder" :size="80" />
          </div>
        </template>
        <template v-else>
        <img 
          :src="mediaHelper.getUrl(photo, 'tales', 'full') || undefined" 
          :alt="photoCaption || title" 
          class="story-content__image"
          :class="{ 'story-media__image--placeholder': photo === '***placeholder***' }"
        />
     
        </template>
 </div>
      <figcaption v-if="photoCaption" class="story-media__caption">
        {{ photoCaption }}
      </figcaption>
    </figure>

    <!-- SECTION 4: RICH TEXT BODY -->
      <section class="story-details">
         <div class="rich-text rich-text--tale" v-html="sanitizeHtml(content)"></div>
      </section>

       <template v-if="addendum && addendumDate">
        <section class="story-addendum">
        <div class="story-addendum__heading">
          <h4 class="story-addendum__heading--title">Updated</h4>
          <span class="divider divider--circle"></span>
          <time class="story-addendum__heading--date"> {{ toRelativeTime(addendumDate) }}</time>
        </div>
        <ol class="story-addendum__list">
          <li  class="story-addendum__list--item" v-for="(entry, index) in formatAddendum(addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </section>
      </template>


    <!-- SECTION 5: REALITY CHECK CALLOUT BOX -->
     <section class="reality-check">

        <div class="reality-check__container">
          <!-- 3px Multi-Color Brand Strip Top Border -->
          <div class="reality-check__brand-strip" aria-hidden="true"></div>

          <!-- Centered Overlap Shield Emblem -->
          <div class="reality-check__shield-wrapper">
            <SvgIcons name="shield" :size="80"  class="reality-check__shield-icon" />
            <span class="reality-check__shield-label">REALITY CHECK</span>
          </div>

          <!-- Claim Title & Summary Body -->
          <div class="reality-check__body">
            <h3 class="reality-check__title">
               {{ realityCheckTitle }}
            </h3>

            <p class="reality-check__summary">
            <span  v-if="realityCheckSource" class="reality-check__source">{{ realityCheckSource }} — </span>
            {{ realityCheckSummary }}
            </p>
          </div>

          <!-- Centralized Source Link with Flanking Lines -->
          <div v-if="realityCheckSource && realityCheckUrl" class="reality-check__footer">
            <div class="reality-check__footer--line" aria-hidden="true"></div>
              <button 
              type="button" 
              class="reality-check__footer--btn"  @click="showExternalLink = !showExternalLink">
             Continue to source
            </button>
            <div class="reality-check__footer--line" aria-hidden="true"></div>
          </div>
          <p v-else class="reality-check__footer--placeholder"></p>




        </div>

      </section>

    <!-- SECTION 6 & 7: ALWAYS PRESENT TAXONOMY -->
    <div class="story-taxonomy">
      <div class="story-taxonomy__group story-taxonomy__group--meta">
        <RouterLink :to="`/tales?category=${category}`" class="story-taxonomy__item story-taxonomy__item--meta">
           <SvgIcons name="tag" />
            {{ CategoryDescriptions[category] }}
        </RouterLink>
         <RouterLink :to="`/tales?country=${country}`" class="story-taxonomy__item story-taxonomy__item--meta">
           <SvgIcons name="globe" />
            {{ CountryDescriptions[country] }}

        </RouterLink>
      </div>
            <div class="divider-multi"><span></span></div>

      <div v-if="tags?.length" class="story-taxonomy__group story-taxonomy__group--tags">
         <button 
          v-for="tag in tags" 
          :key="tag.tagId" 
          class="story-taxonomy__item story-taxonomy__item--tag" 
          type="button"  
          @click="modalStore.push('TagDetail', 'Tag Details', tag.tagId)">
            #{{ tag.name }}
          </button>

      </div>
    </div>
</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";
@import "@/assets/css/rich-text.less";


//STORY HEADER
.story-header {
    width: 100%;

     &__title {
      text-align: center;
      font-size: clamp(2.2rem, 5vw, 2.8rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
    }
     
    &__summary {
      font-size: clamp(0.95rem, 5vw, 1.1rem);
      margin-bottom: 2rem;
      text-align: center;
      color: var(--muted-text-color);
    }
    
&__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;

  &-item {
    font-weight: 600;

    &--right {
      text-transform: none; // Allows natural "2 hours ago" formatting
      font-weight: 500;
    }
  }
}


}

//STORY MEDIA
.story-media {
  width: 100%;
  margin-bottom: 2rem;

  &__frame {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 6px;
    background-color: var(--light-background-color);

  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

   &__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
          

      color: var(--muted-link-color);
    }


  &__caption {
    font-size:0.9rem;
    line-height: 1;
    padding: 0.5rem 0.25rem 0 0.25rem;
    color: var(--muted-text-color);
    font-style: italic;
    text-align: center;
    word-break: break-word; // Ensures long text wraps cleanly
  }
}

//STORY DETAILS
.story-details{
  margin-bottom: 2rem;
}

//REALITY CHECK
.reality-check {
  margin-bottom: 3rem;
  margin-top: 4.75rem;

  &__container{
    position: relative;
    padding-top: 2.5rem;
  }

  
  &__brand-strip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background: linear-gradient(
      90deg,
      @logo-green 0%,
      @logo-red 25%,
      @logo-purple 50%,
      @logo-orange 75%,
      @logo-yellow 100%
    );
  }

  &__shield-wrapper {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;

  }

    &__shield-icon {
      color: @logo-red;
    }

    &__shield-label {
      position: absolute;
      z-index: 6;
      font-family: @font-mono;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
       color: @logo-red;
      //background: linear-gradient(135deg, @logo-red 0%, #b91c1c 100%);
      background-color: var(--background-color);
      padding: 0.2rem 0.45rem;
      border-radius: 3px;
      //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      white-space: nowrap;
    }

  &__body {
    text-align: center;
    padding:1.25rem;
  }

  &__title {
    font-size: 1.5rem;
    line-height: 1.35;
    margin: 0 0 0.65rem 0;
  }

  &__summary {
    color: var(--muted-text-color);
    font-size: 1.1rem;
    line-height: 1.5;

    & span{
      font-weight:600;
    }
  
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.25rem;

    &--line {
      flex: 1;
      height: 2px;
      background-color: @logo-red;
    }

    
  /* BRAND-ALIGNED SOURCE BUTTON */
&--btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.35rem;
  background-color: @logo-red; // Core brand green
  color: @white-color;
  font-size:0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border-radius: 99999px;
  text-decoration: none;
  white-space: nowrap;
  //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background-color: lighten(@logo-red, 6%); // Deeper emerald on hover
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    color:@white-color;
  }

  &:active {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    
  }
}

  &--placeholder{
    height: 2px;
    background-color: @logo-red;
  }


  }


  
}

//ADDENDUM
.story-addendum {
    margin-bottom: 2rem;

    &__heading{
      margin-bottom: 0.5rem;
      display: flex;
      align-items:center;
      column-gap: 0.25rem;

      &--title{
         font-weight: 600;
         text-transform: uppercase;
         font-size: 1.1rem;
      }

      &--date{
        color: var(--muted-text-color);
      }
    }

  &__list {
     list-style: disc;
     margin: 0.75rem 0 1rem 1.25rem;

      &--item {
       margin-bottom: 0.5rem;
        color: var(--muted-text-color);
    font-size: 1.1rem;
    line-height: 1.5;
      }
    }
}


//STORY TAXONOMY
.story-taxonomy{
  margin-bottom: 2px;

&__group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
   
 
}
       
  &__item {
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

}


</style>