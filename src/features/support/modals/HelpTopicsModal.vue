<script setup>
const props = defineProps({
  payload: {
    type: String,
    required: true
  }
});
</script>

<template>

  <div class="help-topics-container">
    <!-- Topic: Create Account -->
     <template v-if="payload === 'CreateAccount'">

          <div class="topic-content">
      <h4>Creating Your OutScribed Account</h4>
      <p>
        Enter a valid email address and password. Once submitted, a single-use verification token 
        will be sent to your inbox to activate your account.
      </p>
    </div>
     </template>
  

    <!-- Topic: Login -->
       <template v-else-if="payload === 'LoginAccount'">
         <div class="topic-content">
      <h4>Understanding Watchlists</h4>
      <p>
        Watchlists allow you to monitor active legal developments and news items. 
        Click the pin icon on any item to receive updates when new Insights are linked.
      </p>
    </div>

     </template>
   
    <!-- Topic: Submitting Tales -->
       <template v-else-if="payload === 'ResetPassword'">
          <div class="topic-content">
      <h4>Publishing a Tale</h4>
      <p>
        Tales are fictional narratives used to explore real-world scenarios. 
        Select a primary category and draft your text before submitting for review.
      </p>
    </div>

     </template>
  
    <!-- Fallback / Default -->
       <template v-else>
           <div class="topic-content">
      <h4>Help & Support</h4>
      <p>No specific details are available for this section yet.</p>
    </div>
     </template>
 
  </div>
</template>