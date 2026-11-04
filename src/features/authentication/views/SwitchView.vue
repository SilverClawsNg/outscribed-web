<template>

<div class="auth-card">

      <div class="auth-card__header">
      <div class="auth-card__header--logo">
        <router-link to="/" class="main-header__brand-link" title="OutScribed Home">
          <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
        </router-link>
      </div>
      <h1 class="auth-card__header--title">Sign Up</h1>
      <p class="auth-card__header--subtitle">to become an OutScriber</p>
      <HelpIcon topic="CreateAccount" />
    </div>

    <div class="auth-card__form">

     <label class="auth-card__form--label">It looks like an account is already active on this device. 
        Would you like to log out to register a new account. </label>

      <router-link to="/logout" class="auth-card__form--action">
           Logout
          </router-link>

      <div class="auth-card__form--option">
        <span>Don't want to logout yet?</span>
         <router-link to="/">
           Return to homepage
          </router-link>
      </div>

    </div>
    
</div>

</template>

<style scoped lang="less">
@import "@/assets/css/auth-card.less";
</style>