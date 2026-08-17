<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SvgIcons from '@/components/SvgIcons.vue'
import { postAsync } from '@/api/apiPostServices'
import { type Engageable} from '@/features/engagements/types/EngagementTypes';
import { useLoginHint } from '@/utils/authHelper'

// 1. Type-based props definition
const props = defineProps<{
  title: string;
  summary: string;
  url: string;
  contentId: string;
  contentType: string;
  engageable: Engageable;
}>();


const isNativeShareSupported = ref(false);
const linkCopied = ref(false);
    const isLoggedIn = useLoginHint()

// Check for Web Share API support on mount (mobile browsers)
onMounted(() => {
  isNativeShareSupported.value = !!navigator.share;
});

// Helper to fire-and-forget analytics back to your backend
const logShareMetric = async (platformType: string) => {
  try {

    
    if(isLoggedIn.value){
         const outcome =  await postAsync('api/sharing/authenticated', { 
        contentId: props.contentId, 
        content: props.contentType,
        contact: platformType
     }, true);

       if (outcome.value) {
         Object.assign(props.engageable, outcome.value);
      }
    }
    else{
        const outcome =  await postAsync('api/sharing/anonymous', { 
        contentId: props.contentId, 
        content: props.contentType,
        contact: platformType
     }, false);

       if (outcome.value) {
         Object.assign(props.engageable, outcome.value);
      }
    }

     const typeLabel = props.contentType.toLowerCase();
    localStorage.removeItem(`${typeLabel}:anchor:shares`);

  } catch (err) {
    // Non-blocking catch so social share still functions even if logging fails
    console.warn('Failed to log share metric:', err);
  }
};

// 1. Mobile Native Share Handler
const handleNativeShare = async () => {
  try {
    await navigator.share({
      title: props.title,
      text: props.summary,
      url: props.url
    });
    // Log generic native share metric after successful trigger
    await logShareMetric('native_share_sheet');
  } catch (err) {
    // User cancelled share action
  }
};

// 2. Clipboard Fallback Handler
const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url);
    linkCopied.value = true;
    await logShareMetric('CopyLink');
    
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
};

// 3. Computed Target URLs for Desktop/Fallbacks
const encodedUrl = computed(() => encodeURIComponent(props.url));
const encodedTitle = computed(() => encodeURIComponent(props.title));
const shareText = computed(() => encodeURIComponent(`${props.title} - ${props.url}`));

const shareLinks = computed(() => [
  {
    name: 'WhatsApp',
    type: 'WhatsApp',
    url: `https://api.whatsapp.com/send?text=${shareText.value}`,
    cssClass: 'wa'
  },
  {
    name: 'X / Twitter',
    type: 'Twitter',
    url: `https://twitter.com/intent/tweet?text=${encodedTitle.value}&url=${encodedUrl.value}`,
    cssClass: 'x'
  },
  {
    name: 'LinkedIn',
    type: 'LinkedIn',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
    cssClass: 'li'
  },
  {
    name: 'Facebook',
    type: 'Facebook',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
    cssClass: 'fb'
  },
  {
    name: 'Email',
    type: 'Email',
    url: `mailto:?subject=${encodedTitle.value}&body=${encodeURIComponent(`I thought you might find this interesting:\n\n${props.title}\n\n${props.url}`)}`,
    cssClass: 'email'
  }
]);

// Click wrapper for desktop link targets
const handleDesktopShareClick = (platformType: string) => {
  logShareMetric(platformType);
};
</script>

<template>

  <div class="content-details__share-bar">

    <template v-if="isNativeShareSupported">
        <div class="content-details__engagement-stats">
             <button @click="handleNativeShare">
              <SvgIcons name='share' /> Share this tale
            </button>
          </div>
    </template>

    <template v-else>
    <!-- Path B: Desktop or Fallback Row -->
    <div class="content-details__share-links">
      <a
        v-for="link in shareLinks"
        :key="link.type"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        :class="['btn primary', link.cssClass]"
        @click="handleDesktopShareClick(link.type)"
      >
        {{ link.name }}
      </a>

      <button class="btn secondary" @click="handleCopyLink">
        {{ linkCopied ? 'Copied!' : 'Copy Link' }}
      </button>
    </div>
    </template>

  </div>
</template>

<style scoped>
@import "@/assets/css/share-bar.less";
</style>