<script setup lang="ts">
import { ref } from 'vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'

const props = defineProps<{
  captchaState: string
  errorMessage: string
}>()

const emit = defineEmits<{
  (e: 'success', token: string): void
  (e: 'reset'): void
}>()

const captchaToken = ref<string | null>(null)
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)

function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
  emit('success', token)
}

function handleCaptchaError() {
  captchaToken.value = null
}

</script>

<template>
  <template v-if="!captchaToken">
    <template v-if="props.captchaState === 'FAILED'">
      <PageStatusMessage 
        title="Verification Failed!" 
        :message="props.errorMessage"
        icon="shield" 
        :is-standalone="true"
      >
        <template #actions>
          <button type="button" class="btn btn--secondary" @click="emit('reset')">
            Try Again
          </button>
        </template>
      </PageStatusMessage>
    </template>

    <template v-else>
      <PageStatusMessage 
        title="Performing security verification!" 
        message="This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot."
        icon="shield" 
        :is-standalone="true"
      />

      <TurnstileWidget 
        :site-key="siteKey" 
        @success="handleCaptchaSuccess"
        @error="handleCaptchaError"
      />
    </template>
  </template>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>