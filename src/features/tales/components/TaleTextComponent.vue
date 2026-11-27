<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement'

import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type TaleListDto } from '../types/TalesTypes'
import { CategoryDescriptions, CountryDescriptions, CountryFlags } from '@/utils/descriptors'

const modalStore = useModalStore()
const engage = useEngagement()

export type TaleContentType = 'gold' | 'silver' | 'bronze' | 'pill'

interface Props {
  tale: TaleListDto
  type?: TaleContentType
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pill',
})

const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement))

const SUMMARY_LIMITS: Record<TaleContentType, number> = {
  gold: 250,
  silver: 175,
  bronze: 145,
  pill: 165,
}

const formattedSummary = computed(() => {
  const raw = (props.tale.summary ?? '').trim().replace(/\s+/g, ' ')
  if (!raw) return ''

  const maxLength = SUMMARY_LIMITS[props.type]
  if (raw.length <= maxLength) return raw

  const slice = raw.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(' ')
  const cleanCut = lastSpace > Math.floor(maxLength * 0.7) ? slice.slice(0, lastSpace) : slice

  return `${cleanCut.replace(/[.,;:\s]+$/, '')}...`
})
</script>

<template>
  <div class="content" :class="`content--${type}`">
    <p class="content__category">
      <RouterLink
        :to="`/tales?category=${tale.category}`"
        class="content__category-link"
      >
        <span>{{ CategoryDescriptions[tale.category] }}</span>
      </RouterLink>
    </p>

    <h3 class="content__title">
      <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
    </h3>

    <p v-if="formattedSummary" class="content__summary">
      {{ formattedSummary }}
    </p>

    <div class="content__meta">
      <button
        type="button"
        class="at content__author"
        @click="modalStore.push('Profile', 'Profile', tale.creatorId)"
      >
        {{ tale.creatorUsername }}
      </button>
      <span class="divider divider--circle" aria-hidden="true"></span>
      <time>{{ toRelativeTime(tale.createdAt) }}</time>
      <span class="divider divider--circle" aria-hidden="true"></span>
      <span>{{ tale.readingTime }} Min Read</span>
      <span class="divider divider--circle" aria-hidden="true"></span>
      <RouterLink :to="`/tales?country=${tale.country}`" class="content__country">
        <span class="content__meta--spaced">{{ CountryFlags(tale.country) }}</span>
        <span>{{ CountryDescriptions[tale.country] }}</span>
      </RouterLink>
    </div>

    <footer class="content__footer">
      <RouterLink class="content__footer--read" :to="`/tale/${tale.slug}`">
        Read &rarr;
      </RouterLink>

      <button
        type="button"
        class="content__footer--save"
        :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled"
        @click="engage.favorite(tale.engagement)"
      >
        <SvgIcons name="bookmark" :size="15" />
        <span>{{ uiMeta.favoriteLongText }}</span>
      </button>
    </footer>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.content {
  width: 100%;
  display: flex;
  flex-direction: column;

  &__category {
    margin: 0 0 0.65rem;
  }

  &__category-link {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--heading-text-color);
    transition: opacity 0.15s ease, border-color 0.15s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__title {
    margin: 0 0 0.55rem;
    font-weight: 700;
    color: var(--heading-text-color);

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        text-underline-offset: 4px;
        text-decoration-thickness: 1px;
      }
    }
  }

  &__summary {
    margin: 0 0 0.85rem;
    font-size: 0.9rem;
    line-height: 1.55;
    color: var(--body-text-color);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem 0.5rem;
    font-size: 0.82rem;
    line-height: 1.4;
    color: var(--muted-text-color);

    a,
    button {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: var(--heading-text-color);
      }
    }

    &--spaced {
      margin-right: 0.25rem;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 0.75rem;
    width: 100%;
    margin-top: auto;
    padding-top: 1rem;
    font-weight: 400;
    font-size: 0.85rem;
    position: relative;
    z-index: 10;

    &--read {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background-color: var(--background-color);
      color: var(--heading-text-color);
      border: 1px solid var(--border-color);
      padding: 0.45rem 0.85rem;
      border-radius: 99999px;
      text-decoration: none;
      transition: background-color 0.15s ease, border-color 0.15s ease;

      &:hover {
        background-color: var(--surface-background-color, rgba(128, 128, 128, 0.08));
      }
    }

    &--save {
      display: inline-flex;
      align-items: center;
      column-gap: 0.3rem;
      background: transparent;
      border: 0;
      padding: 0.35rem 0.4rem;
      color: var(--muted-text-color);
      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      transition: color 0.15s ease;

      &:hover:not(:disabled) {
        color: var(--heading-text-color);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

// -------------------------------------------------------------
// Mobile-First Tier Typography (< 992px)
// -------------------------------------------------------------
.content--gold .content__title {
  font-size: 1.35rem;
  line-height: 1.28;
}

.content--silver .content__title {
  font-size: 1.2rem;
  line-height: 1.32;
}

.content--bronze .content__title,
.content--pill .content__title {
  font-size: 1.1rem;
  line-height: 1.35;
}

.content--bronze .content__summary,
.content--pill .content__summary {
  font-size: 0.86rem;
  line-height: 1.5;
}

// -------------------------------------------------------------
// Desktop Tier Progression (>= 992px: Gold > Silver > Bronze > Pill)
// -------------------------------------------------------------
@media (min-width: 992px) {
  .content--gold .content__title {
    font-size: 1.85rem;
    line-height: 1.18;
    letter-spacing: -0.02em;
  }

  .content--gold .content__summary {
    font-size: 1rem;
    line-height: 1.6;
  }

  .content--silver .content__title {
    font-size: 1.42rem;
    line-height: 1.24;
    letter-spacing: -0.015em;
  }

  .content--silver .content__summary {
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .content--bronze .content__title {
    font-size: 1.18rem;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .content--bronze .content__summary {
    font-size: 0.88rem;
    line-height: 1.52;
  }
}
</style>