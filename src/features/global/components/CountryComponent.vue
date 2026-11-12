<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { formatCounts } from '@/utils/stringHelpers'
import { type CountryMetricsDto } from '../types/GlobalTypes';
import { useModalStore } from '@/stores/modalStore'
import { CountryDescriptions, CountryFlags } from '@/utils/descriptors'
import SvgIcons from '@/components/SvgIcons.vue'

const modalStore = useModalStore()

interface Props {
  country: CountryMetricsDto;
  type?: 'focus' | 'pill';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pill'
});

</script>

<template>

 <article class="discovery-card" 
          :class="[type === 'focus' ? 'discovery-card--focus' : 'discovery-card--pill']">

          <h3 class="discovery-card__title"
            :class="[type === 'focus' ? 'discovery-card__title--focus' : 'discovery-card__title--pill']">

             <span class="flag">{{ CountryFlags(country.country) }}</span>{{ CountryDescriptions[country.country] }}
            </h3>

              <div class="discovery-card__actions"
              :class="[type === 'focus' ? 'discovery-card__actions--focus' : 'discovery-card__actions--pill']">

                    <button 
                        type="button" 
                        class="btn btn--primary btn--outscribe"
                         :class="[type === 'focus' ? 'btn--primary-white' : null]"
                        @click="modalStore.push('CreateTale', 'Create Tale', { country: country.country })"
                        title="OutScribe a new tale"
                      >
                      OutScribe
                      </button>
                       <RouterLink 
                    :to="`/tales?country=${country.country}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': country.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(country.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>

   
</template>

<style lang="less" scoped>
@import "@/assets/css/discovery-card.less";
</style>