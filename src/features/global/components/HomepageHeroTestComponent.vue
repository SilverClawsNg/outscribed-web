<script setup lang="ts">
import { formatCounts } from '@/utils/stringHelpers'
import { useLoginHint } from '@/utils/authHelper'
import { RouterLink, useRouter } from 'vue-router'
import { useHomeStore } from '../stores/HomeStore'; 
import { useModalStore } from '@/stores/modalStore'

const isLoggedIn = useLoginHint()
const router = useRouter()
const homepageStore = useHomeStore();
const modalStore = useModalStore()

function handleJoinClick() {
  if (isLoggedIn.value) {
    router.push('/switch');
  } else {
    router.push('/register');
  }
}
</script>
<template>
<section class="hero">
  <div class="hero__inner">

    <!-- Left Column: Editorial Copy & CTAs -->
    <div class="hero__content">

        <p class="hero__byline">The Facts, The Fiction, <span>& Everything In-Between</span></p>
      <h1 class="hero__title">
        The reality you know is <span>just one version.</span>
      </h1>

      <p class="hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past,
        reframe the present, and sculpt futures.
      </p>

      <div class="hero__actions">
          <router-link to="/about-us" class="btn hero__actions--primary">
          How it works!
        </router-link>
          <router-link to="/tales" class="btn hero__actions--secondary">
          Read Stories
        </router-link>
       
      </div>
    </div>

    <!-- Right Column: Three-Perspective Cutout -->
    <div class="hero__media">
      <img
        src="@/assets/images/hero-background-circled.png"
        alt="Three perspectives looking past, present, and future"
        class="hero__image"
      />
    </div>
  </div>
</section>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

@gutter: (100 / 1300) * 100%;  // 1.53846% (20px at 1300px)
@left-container: (750 / 1300) * 100%;   // 57.6923% (750px at 1300px)
@right-container: (450 / 1300) * 100%; // 40.7692% (530px at 1300px)

.hero {
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  background-color: @site-background-color;
  color:@white-color;
  
  margin-top:-1px;

  @media @phone, @phablet{
           padding: 1.5rem 0;
        }

         @media @tablet{
           padding: 2.5rem 0;
        }

        @media @laptop, @desktop{
          padding: 1rem 0;
        }

  &__inner {
    max-width: calc(100% - 20px); // 1300px
    margin: 0 auto;
    display: flex;
    align-items:  center;
  
      @media @desktop, @laptop{
            width: @max-width;
            column-gap: @gutter;
        }

        @media @tablet{
            width: 100%;
            column-gap: @gutter;
        }

        @media @phablet{
            width: @mod-width;
            flex-direction: column;
        }

        @media @phone{
            width: 100%;
             flex-direction: column;
        }
  
  }

  &__content {

      @media @largeDevice{
          width: @left-container;
        }

        @media @smallDevice{
            width: 100%;
            display: flex;
            align-items:center;
            flex-direction: column;
            text-align:center;
        }

  }

  &__byline {
    margin: 0 0 0.85rem;
    font-size: 0.78rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color:@white-color;

     @media @phone, @phablet{
        & span{
            display: block;
        }
    }

    
   
  }

  &__title {
    margin: 0 0 1.1rem;
    font-size: clamp(2.2rem, 4vw, 4.5rem);
    line-height: 1.12;
    font-weight: 700;
    letter-spacing: -0.02em;
    color:@white-color;
    //color: var(--heading-text-color);

      @media @phone, @phablet{
           max-width: 20ch;
        }

  
  }

  &__explainer {
    margin: 0 0 1.75rem;
    font-size: 1.15rem;
    line-height: 1.4;
    max-width: 54ch;
    

  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;

    @media @phone, @phablet{
        justify-content:center;
    }

    &--primary{
        background-color:@link-color;
        color:@white-color;
    }

       &--secondary{
        //background-color:@white-color;
        color:@white-color;
        border: 1.6px solid @white-color;

    }
  }

  &__media {
   display: flex;

      @media @largeDevice{
          width: @right-container;
           
            justify-content: flex-end;
        }

        @media @smallDevice{
            width: 100%;
            justify-content:center;
            padding: 1.5rem 0;

        }
  
  }

  &__image {
    display: block;
    width: 100%;
    
    height: auto;
    object-fit: contain;

     @media @largeDevice{
        max-width: 440px;
        }

        @media @smallDevice{
          max-width: 340px;
        }
   
  }
}
</style>