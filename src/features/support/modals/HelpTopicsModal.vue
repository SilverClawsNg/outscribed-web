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

        <div class="topic-content rich-text">
            <h4>Creating An OutScribed Account</h4>
            <p>Creating an account moves you from a casual reader to an active voice. An account allows you to post insights, join conversations via comments, rate and flag pieces, and save your favorite content.</p><p><i>Note: If you plan to publish Tales, you will just need to complete a quick, one-time writer profile setup from your account dashboard after signing up!</i></p><p><strong>The 3-Step Guide:</strong></p><ul><li><strong>Quick Security Check: </strong> In an effort to create a secured environment for all our users, we perform a security check to confirm that bots cannot indiscriminatory create fake account. After the security check is complete, simple tick a box that would be provided.</li><li><strong>Step 1 (Request Verification Token):</strong> Enter a valid email address to receive a verification token from us.</li><li><strong>Step 2 (Enter Your Token):</strong> Check your inbox for a message from OutScribed containing a 6-digit One-Time Password (OTP) and enter it back on the registration page.</li><li><strong>Step 3 (Set Up Credentials):</strong> Choose a unique username, set a strong password, and enter your name. Once submitted, you will be instantly logged in and redirected to your personal Timeline!</li></ul><p><strong>Common Troubleshooting Tips:</strong></p><ul><li><strong>"Email Already Registered":</strong> Try logging in instead, or use <i>Forgot Password</i> if you cannot remember your credentials.</li><li><strong>"Username Taken":</strong> Try adding a number or shifting wording slightly to claim an available handle.</li><li><strong>Missing Verification Token:</strong> Check your Spam/Junk folder. If missing, hit <i>Resend</i> after the 90-second cooldown expires.</li><li><strong>"Expired Token":</strong> Security tokens expire after 10 minutes. Request a fresh token on the page.</li><li><strong>"Account Lockout":</strong> Too many token requests trigger a temporary security cooldown. Take a 30-minute break before trying again.</li></ul>        </div>
     </template>

    <!-- Topic: Login -->
       <template v-else-if="payload === 'LoginAccount'">
         <div class="topic-content rich-text">
      <h4>Logging Into Your Account</h4>
      <p>After creating an account with OutScribed, you can continue to access that account from any device by logging in with your registered username and password. </p> <p><i>Here are things to note:</i></p> <ul><li><strong>Staying Logged In:</strong> Once logged in, we will remember and keep you logged in for 6 weeks so you can continue enjoying a seamless experience on OutScribed. However if the device is not restricted to your use only then we advice that you always log out when you are done on OutScribed.</li><li><strong>Multiple Devices Login:</strong> You can stay logged in to as many as five (5) devices simultaneously so you can continue enjoying the OutScribed experience on your desktop, laptop, tablet, phablet, and phone all at the same time.</li><li><strong>Forgotten Password:</strong> Yes, losing a password happens to the best of us. While we cannot help you recover a teh same password because we do not store passwords in the same plain form as you entered it -for security purposes - we can help you create a new password. You can start the process by clicking on teh button labeled 'Forgotten password'. </li></ul>
    </div>

     </template>
   
    <!-- Topic: Resetting password -->
       <template v-else-if="payload === 'ResetPassword'">
          <div class="topic-content rich-text">
      <h4>Resetting Lost Password</h4>
    <p>Because account security is our top priority, we never store passwords in plain text—everything is heavily encrypted. While we cannot retrieve your old password, you can set up a secure new one in a few quick steps.</p><p><strong>The 3-Step Password Reset Process:</strong></p><ul><li><strong>Step 1 (Request a Reset Token):</strong> Go to the <i>Forgot Password</i> page, enter the email address used during registration, and complete the security check box.</li><li><strong>Step 2 (Verify Token):</strong> Check your email inbox for a 6-digit security token and enter it into the verification box on the reset screen.</li><li><strong>Step 3 (Create New Password):</strong> Choose a fresh, strong password. Once confirmed, you will immediately regain access to your account!</li></ul><p><strong>Common Troubleshooting Tips:</strong></p><ul><li><strong>"Password Cannot Be Reused":</strong> To protect your account from data leaks, the system blocks reusing recent passwords. Pick a brand-new variation or passphrase.</li><li><strong>"No Reset Email Received":</strong> Check your Spam or Junk folder, and verify that you entered the exact email address associated with your account.</li><li><strong>"Invalid or Expired Token":</strong> Reset tokens are time-limited for security. If the code expired, restart the process to request a fresh token.</li></ul>
    </div>

     </template>
  
    <!-- Topic: Logging out account -->
       <template v-else-if="payload === 'LogoutAccount'">
          <div class="topic-content rich-text">
            <h4>Logging out of Account</h4>
        <p>Once logged in, we can keep you logged in for as long as 60 days however if you are using a shared device like an office workstation then you are advised to always logout when you are done.</p><p><i>Here are things you should note:</i></p><ul><li><strong>Blanket Logout:</strong> When logging out, you have the option to choose to logout only the current device or a blanket termination of all active sessions across all devices.</li><li><strong>Clearing Caches:</strong> When you perform tasks such as creating tales, insights, or comments, we keep memory of such actions on the device you are currently using. This ensures that you do not lose your work due to network discrepancies. When logging out, you must choose whether to remove these memories or keep them. This decision strongly depends on whether you are using a shared device or not.</li></ul>      
        </div>
     </template>

      <!-- Topic: Creating tale -->
       <template v-else-if="payload === 'CreateTale'">
          <div class="topic-content rich-text">
            <h4>Managing Tales</h4>
<p>On OutScribed, transitioning your imagination into a captivating story is fluid. An unregistered visitor can register, complete writer onboarding, and start drafting a Tale in under 10 minutes!</p><p><strong>The Anatomy of a Tale:</strong></p><ul><li><strong>Title & Category:</strong> The headline hook and thematic grouping (Education, Politics, History, etc.). Both are required to initialize a draft.</li><li><strong>Summary:</strong> A short teaser that expands on the title without giving the story away.</li><li><strong>Country:</strong> Optional geographic tag pointing to the real-world setting.</li><li><strong>Cover Image:</strong> Optional Landscape image (750px by 562px recommended in <i>.jpeg</i>, <i>.png</i>, or <i>.webp</i>) accompanied by a short caption.</li><li><strong>Details:</strong> Rich-text editor supporting headers, lists, links, and text formatting.</li><li><strong>Watchlist:</strong> The real-world news or article links backing up your fiction (includes source title, URL, and summary).</li></ul><p><strong>Creating and Publishing Steps:</strong></p><ul><li><strong>Step 1 (Spin Your Draft):</strong> Click <i>OutScribe</i> in the top-right corner. All Tales start as private drafts.</li><li><strong>Step 2 (Update Attributes):</strong> Access your Tales editor from the top-left user menu to add your rich-text details, cover image, and Watchlist sources.</li><li><strong>Step 3 (Preview & Go Live):</strong> Preview your story, check the publication confirmation box, and release it to the community!</li></ul><p><strong>Post-Publication & Archiving Rules:</strong></p><p>Once a Tale receives community engagement (upvotes, comments, shares, etc.), direct editing and deletion are locked to preserve community integrity.</p><p><i>Need to make corrections? You can attach addendums for updates. Need to hide a story? You can self-archive it anytime, hiding it publicly while allowing past engagers to retain access (and you can un-archive it whenever you want).</i></p>        
</div>
     </template>

      <!-- Topic: Creating insight -->
       <template v-else-if="payload === 'CreateInsight'">
          <div class="topic-content rich-text">
            <h4>Managing Insights</h4>
<p>While Tales use creative fiction to throw light on facts, Insights focus those issues straight onto their real-life legal and social implications for the ordinary person. Insights are always anchored directly to an existing Tale.</p><p><strong>The Anatomy of an Insight:</strong></p><ul><li><strong>Title & Category:</strong> The headline hook and category grouping. Category defaults to the parent Tale's category, but can be changed. Both are required to initialize a draft.</li><li><strong>Summary:</strong> A short teaser expanding on the title.</li><li><strong>Country:</strong> Optional tag identifying the real-world geographic setting.</li><li><strong>Cover Image:</strong> Landscape image (750px by 562px recommended in <i>.jpeg</i>, <i>.png</i>, or <i>.webp</i>) with a short caption.</li><li><strong>Details:</strong> Rich-text analysis supporting headers, lists, links, and formatting.</li></ul><p><strong>4-Step Creation and Launching Process:</strong></p><ul><li><strong>Step 1 (Find Your Inspiring Tale):</strong> Browse the platform to find the Tale addressing the issues you want to analyze.</li><li><strong>Step 2 (Spin the Insight Draft):</strong> Click <i>Write An Insight</i> directly on that Tale's details page. Provide a title to save your draft. (No extra writer onboarding required!)</li><li><strong>Step 3 (Update Attributes):</strong> Open your Insights editor from the top-left user menu to add your rich-text details, cover image, and country setting.</li><li><strong>Step 4 (Preview & Go Live):</strong> Preview your piece, check the publish box, and launch your Insight to the world!</li></ul><p><strong>Post-Publication & Archiving Rules:</strong></p><p>Once an Insight receives community engagement (upvotes, comments, shares, etc.), direct editing and deletion are locked to preserve community integrity.</p><p><i>Need to make corrections? Attach addendums for updates. Need to hide a piece? Self-archive it anytime to hide it publicly while allowing past engagers to retain access (and un-archive it whenever you want).</i></p>
</div>
     </template>

      <!-- Topic: Tagging contents -->
       <template v-else-if="payload === 'TagContent'">
          <div class="topic-content rich-text">
            <h4>Tagging Contents</h4>
<p><strong>Tags</strong> help categorize your <i>Tales</i> and <i>Insights</i> so readers and legal researchers can easily discover your content across the platform.</p><p><i>Why Tagging Matters</i></p><p>Adding relevant tags directly increases your content's visibility in search results, watchlist feeds, and related story recommendations.</p><p><i>Tagging Guidelines & Format</i></p><ul><li><strong>Maximum Limit:</strong> You can add up to <strong>10 tags</strong> per submission and update them at any time.</li><li><strong>Optimal Length:</strong> Keep tags concise but explanatory—aim for <strong>2 words</strong> (maximum of 3 words). </li><li><strong>Keep Natural Spacing:</strong> Do not use single-word run-ons or hashtags (e.g., use <i>tenant rights</i> instead of <i>#tenantrights</i>).</li><li><strong>Avoid Generic Terms:</strong> Skip vague words like <i>law</i>, <i>news</i>, or <i>story</i>. Focus on specific legal statutes, concepts, or core themes (e.g., <i>constructive eviction</i>, <i>fair use</i>).</li></ul>
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

<style lang="less" scoped>
@import "@/assets/css/rich-text.less";
</style>