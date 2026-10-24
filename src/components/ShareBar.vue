<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { postAsync } from '@/api/apiPostServices'
import { type Engageable } from '@/features/engagements/types/EngagementTypes'
import { useLoginHint } from '@/utils/authHelper'

// 1. Explicit type definition matching SvgIcons name prop
type SupportedIconName = 'whatsapp' | 'twitter' | 'linkedin' | 'facebook' | 'email' | 'share' | 'broken-chain'

interface ShareLinkItem {
  name: string
  type: string
  iconName: SupportedIconName
  url: string
  modifier: string
}

const props = defineProps<{
  title: string
  summary: string
  url: string
  contentId: string
  contentType: string
  engageable: Engageable
}>()

const isNativeShareSupported = ref(false)
const linkCopied = ref(false)
const isLoggedIn = useLoginHint()

onMounted(() => {
  isNativeShareSupported.value = !!navigator.share
})

const logShareMetric = async (platformType: string) => {
  try {
    const endpoint = isLoggedIn.value ? 'api/sharing/authenticated' : 'api/sharing/anonymous'
    const outcome = await postAsync(
      endpoint,
      {
        contentId: props.contentId,
        content: props.contentType,
        contact: platformType
      },
      isLoggedIn.value
    )

    if (outcome.value) {
      Object.assign(props.engageable, outcome.value)
    }

    const typeLabel = props.contentType.toLowerCase()
    localStorage.removeItem(`${typeLabel}:anchor:shares`)
  } catch (err) {
    console.warn('Failed to log share metric:', err)
  }
}

const handleNativeShare = async () => {
  try {
    await navigator.share({
      title: props.title,
      text: props.summary,
      url: props.url
    })
    await logShareMetric('native_share_sheet')
  } catch (err) {
    // User cancelled share sheet
  }
}

const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    linkCopied.value = true
    await logShareMetric('CopyLink')

    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

const encodedUrl = computed(() => encodeURIComponent(props.url))
const encodedTitle = computed(() => encodeURIComponent(props.title))
const shareText = computed(() => encodeURIComponent(`${props.title} - ${props.url}`))

// Typed share links array resolving iconName strict union errors
const shareLinks = computed<ShareLinkItem[]>(() => [
  {
    name: 'WhatsApp',
    type: 'WhatsApp',
    iconName: 'whatsapp',
    url: `https://api.whatsapp.com/send?text=${shareText.value}`,
    modifier: 'whatsapp'
  },
  {
    name: 'X / Twitter',
    type: 'Twitter',
    iconName: 'twitter',
    url: `https://twitter.com/intent/tweet?text=${encodedTitle.value}&url=${encodedUrl.value}`,
    modifier: 'twitter'
  },
  {
    name: 'LinkedIn',
    type: 'LinkedIn',
    iconName: 'linkedin',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
    modifier: 'linkedin'
  },
  {
    name: 'Facebook',
    type: 'Facebook',
    iconName: 'facebook',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
    modifier: 'facebook'
  },
  {
    name: 'Email',
    type: 'Email',
    iconName: 'email',
    url: `mailto:?subject=${encodedTitle.value}&body=${encodeURIComponent(`I thought you might find this interesting:\n\n${props.title}\n\n${props.url}`)}`,
    modifier: 'email'
  }
])
</script>

<template>
  <article class="share-bar">
    <!-- NATIVE SHARE SHEET ACTION (ALWAYS VISIBLE IF SUPPORTED) -->
    <div v-if="isNativeShareSupported" class="share-bar__native-section">
      <button type="button" class="share-card share-card--native" @click="handleNativeShare">
        <div class="share-card__icon share-card__icon--native">
          <SvgIcons name="share" />
        </div>
        <div class="share-card__content">
          <span class="share-card__label">Share Via Device</span>
          <span class="share-card__value">Open system share options</span>
        </div>
      </button>
    </div>

    <!-- DIRECT SOCIAL LINKS GRID -->
    <div class="share-bar__grid">
      <a
        v-for="link in shareLinks"
        :key="link.type"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="share-card"
        @click="logShareMetric(link.type)"
      >
        <div :class="['share-card__icon', `share-card__icon--${link.modifier}`]">
          <SvgIcons :name="link.iconName" />
        </div>
        <div class="share-card__content">
          <span :class="['share-card__label', `share-card__label--${link.modifier}`]">
            {{ link.name }}
          </span>
          <span class="share-card__value">Share story</span>
        </div>
      </a>

      <!-- COPY LINK ACTION CARD -->
      <button type="button" class="share-card share-card--copy" @click="handleCopyLink">
        <div class="share-card__icon share-card__icon--copy">
          <SvgIcons name="broken-chain" />
        </div>
       
      </button>
    </div>
  </article>
</template>

<style scoped>
@import "@/assets/css/share-bar.less";
</style>