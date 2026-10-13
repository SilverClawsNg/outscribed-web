
<script setup lang="ts">
import SvgIcons from '@/components/SvgIcons.vue'
</script>
<template>
  <div class="contact-page">
    <div class="contact-container">
      
      <!-- Header Section -->
      <div class="contact-header">
        <h1 class="contact-header__title">Contact &amp; Support</h1>
        <p class="contact-header__subtitle">
          We are here to help you navigate OutScribed, troubleshoot account issues, or address legal and editorial queries.
        </p>
      </div>

      <!-- FAQ Self-Service Banner -->
      <div class="faq-banner">
        <div class="faq-banner__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="faq-banner__content">
          <h2>Looking for quick answers?</h2>
          <p>
            Before reaching out, check our comprehensive FAQ guide for step-by-step instructions on creating tales, managing your profile, attaching watchlists, and understanding engagement metrics.
          </p>
          <router-link to="/faqs" class="btn btn--secondary">
            Visit the FAQ Center
          </router-link>
        </div>
      </div>

      <!-- Contact Channels Grid -->
      <div class="contact-grid">
        
        <!-- Direct Email Support -->
        <div class="contact-card">
          <div class="contact-card__header">
            <h3>Email Support</h3>
            <p>For account recovery, bug reports, or platform inquiries not covered in our FAQs.</p>
          </div>
          <div class="contact-card__body">
            <a href="mailto:support@outscribed.com" class="contact-link">
              <strong>General Support:</strong> support@outscribed.com
            </a>
            <a href="mailto:copyright@outscribed.com" class="contact-link">
              <strong>DMCA &amp; Legal:</strong> copyright@outscribed.com
            </a>
          </div>
        </div>

        <!-- Social Channels -->
        <div class="contact-card">
          <div class="contact-card__header">
            <h3>Social &amp; Community</h3>
            <p>Follow our official channels for updates or reach out via direct message.</p>
          </div>
          <div class="contact-card__body">
            <ul class="social-list">
              <li>
                <a href="https://x.com/outscribed" target="_blank" rel="noopener noreferrer" class="social-link">
                    <SvgIcons name="twitter" /> 
                  <span class="social-link__name">X (Twitter)</span>
                  <span class="social-link__handle">@OutScribed</span>
                </a>
              </li>
              <li>
                <a href="https://facebook.com/outscribed" target="_blank" rel="noopener noreferrer" class="social-link">
                 <SvgIcons name="facebook" /> 
                    <span class="social-link__name">Facebook</span>
                  <span class="social-link__handle">/OutScribed</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/contact.less";
</style>
