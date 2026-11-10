
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
          <SvgIcons name="help" :size="30"/>
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
@import "@/assets/css/variables.less";

.contact-page {
  padding: 3rem 0;

  .contact-container {
    width: @mid-width;
    max-width: calc(100% - 20px);
    margin: 0 auto;
  }

  .contact-header {
    text-align: center;
    margin-bottom: 2.5rem;

    &__title {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 1.05rem;
      max-width: 80%;
      margin: 0 auto;
      line-height: 1.5;
    }
  }

  // Self-Service FAQ Box
  .faq-banner {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    border-left: 4px solid @link-color;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2.5rem;

    &__icon {
      color: @link-color;
      flex-shrink: 0;
      margin-top: 0.2rem;

      & svg{
        stroke-width: 2;
      }


    }

    &__content {
      h2 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }

      p {
        font-size: 0.925rem;
        line-height: 1.5;
        margin-bottom: 1rem;
      }
    }
  }

  // Cards Grid
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media @tablet, @largeDevice {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .contact-card {
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__header {
      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 0.4rem 0;
      }

      p {
        font-size: 0.875rem;
        margin: 0 0 1.25rem 0;
        line-height: 1.4;
      }
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  .contact-link {
    font-size: 0.9rem;
    text-decoration: none;
    line-height: 1.4;

    strong {
      font-weight: 600;
      display: block;
      font-size: 0.8rem;
    }

    &:hover {
      color: @link-color;
      text-decoration: underline;
    }
  }

  .social-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .social-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    border-left: 4px solid @link-color;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;

    &__name {
      font-weight: 500;
    }

    &__handle {
      font-size: 0.825rem;
    }

    &:hover {
      background-color: var(--background-color);
    }
  }
}
</style>
