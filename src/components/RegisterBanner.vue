<script setup lang="ts">
import { ref, onMounted } from 'vue';

// --- Types ---
export interface BannerPreset {
  id: string;
  imageUrl: string;
  imageAlt: string;
  headline: string;
  accentText?: string;
  buttonText?: string;
}

// --- Dynamic Content Pools ---
const bannerPool: BannerPreset[] = [
  {
    id: 'cant-say-it',
    imageUrl: '/src/assets/images/writing-girl.png',
    imageAlt: 'Girl sitting with giant fountain pen',
    headline: "Can't say it yourself?",
    accentText: 'Outscribe it',
    buttonText: 'OutScribe It'
  },
  {
    id: 'change-the-world',
    imageUrl: '/src/assets/images/writing-girl.png', // Fallback to primary image if alt not available
    imageAlt: 'Creative writer reflecting',
    headline: 'Changing the world is tough...',
    accentText: 'Start with a tale',
    buttonText: 'OutScribe It'
  }
];

// Active selection state
// Define ref to allow undefined/null initially
const activeBanner = ref<BannerPreset | null>(bannerPool[0] || null);

onMounted(() => {
  if (bannerPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * bannerPool.length);
    activeBanner.value = bannerPool[randomIndex]!;
  }
});
</script>

<template>

<div class="banner-wrapper" v-if="activeBanner">

   <div class="banner" v-if="activeBanner">

    <h2 class="banner__title">
        {{ activeBanner.headline }}
    </h2>

      <router-link to="/register" class="banner-btn banner-btn-primary">
          {{ activeBanner.buttonText || 'OutScribe It' }}
        </router-link>
    
          <div class="banner-subtext">
          <span>Not an outscriber?</span>
          <router-link to="/register" class="subtext-link">
            Become One
          </router-link>
        </div>

  </div>

</div>


</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";


.banner-wrapper {
  width: 100%;
  height: auto;
  position:relative;
  justify-content:center;
  display: flex;
  align-items: center;
  margin-top: -1px;
  background-color: var(--light-background-color);
border-bottom: 1px solid var(--thick-border-color);
  padding: 1rem;
  margin-bottom: 1rem;
  
}

.banner{
  position: relative;
  height: auto;
  z-index: 1;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align:center;
   width: 550px;
   max-width: 100%;
   color: @white-color;
 
  
   @media @smallDevice {
         padding: 2rem 0;
    }

     @media  @largeDevice {
        
         padding: 2rem 0;
    }

    
  &__title {
     font-size: clamp(1.4rem, 5vw, 1.8rem);
          line-height: 1.2;
      font-weight: 800;
      color: var(--text-color);
      margin-bottom: 0.5rem;

  }

    .banner-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto;
      padding: 0.5rem 0.75rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;

      background-color: @link-color;
      color: @white-color;
      box-shadow: var(--button-shadow);

      &:hover {
        background-color: @link-alt-color;
       color: @white-color;
        transform: translateY(-2px);
      }
    }

     /* --- Subtext Link Below Button --- */
    .banner-subtext {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      font-size: 0.95rem;
      color: var(--muted-text-color);

      .subtext-link {
        color: @link-color;
        font-weight: 700;
        text-decoration: underline;

        &:hover {
          color: darken(@link-color, 10%);
        }
      }
    }

}




.register-banner-wrapper {
  width: 100%;
  margin-top: 8rem auto 2rem auto;
  padding: 0 1rem;
  box-sizing: border-box;

  @media @smallDevice {
    max-width: @min-width;
  }

   @media @largeDevice {
    max-width: @mid-width;
  }
}

.register-banner-card {
  position: relative;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0 2rem 2rem 2rem;
  box-shadow: var(--container-shadow);
  text-align: center;
  box-sizing: border-box;

  /* --- Shooting-Out Image --- */
  .banner-image-container {
    position: relative;
    width: 140px;
    max-height: 220px;
    margin: 0 auto;
    top: -95px;
    margin-bottom: -75px;
    pointer-events: none;

    @media (min-width: 768px) {
      width: 310px;
      top: -115px;
      margin-bottom: -90px;
    }

    img {
      width: 100%;
      height: auto;
      display: block;
      filter: var(--image-drop-shadow);
    }
  }

  /* --- Content Layout --- */
  .banner-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .banner-title {
        font-size: clamp(1.4rem, 5vw, 1.8rem);
          line-height: 1.2;
      font-weight: 800;
      color: var(--text-color);
      margin: 0;

    }

    /* --- Primary Button (Matches Card Background) --- */
    .banner-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 260px;
      padding: 0.5rem 0.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;

      background-color: @link-color;
      color: @white-color;
      box-shadow: var(--button-shadow);

      &:hover {
        background-color: @link-alt-color;
       color: @white-color;
        transform: translateY(-2px);
      }
    }

    /* --- Subtext Link Below Button --- */
    .banner-subtext {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      font-size: 0.95rem;
      color: var(--muted-text-color);

      .subtext-link {
        color: @link-color;
        font-weight: 700;
        text-decoration: underline;

        &:hover {
          color: darken(@link-color, 10%);
        }
      }
    }
  }
}
</style>