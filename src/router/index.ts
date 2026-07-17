import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import FormLayout from '@/layouts/FormLayout.vue'
import { checkIsLoggedIn } from '@/utils/authHelper'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // --- STANDARD ROUTE GROUP ---
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '', // Renders at outscribed.com/
          name: 'Home',
          component: () => import('@/features/global/views/HomeView.vue')
        },
        {
          path: 'timelines', // Renders at outscribed.com/timelines
          name: 'Timelines',
          component: () => import('@/features/global/views/TimelineView.vue'),
          meta: { requiresAuth: true, authContext: 'view_timelines' }
        },
        {
          path: 'profile', // Renders at outscribed.com/profile
          name: 'MyProfile',
          component: () => import('@/features/identity/views/ProfileView.vue'),
          meta: { requiresAuth: true, authContext: 'view_profile' }
        },
        {
          // 🎯 ROUTE A: Matches ONLY when a 26-character alphanumeric ID is provided directly
          // Example: /tale/01KTZD9ME4Q6PR2EEGY5PTR6ES
          path: 'tale/:taleId([A-Z0-9]{26})',
          name: 'TaleDetailById',
          component: () => import('@/features/tales/views/TaleDetailView.vue'),
          props: true
        },
         {
          // Matches: /tale/celesteaurora AND /tale/celesteaurora/01KTZD9M/the-art-of-the-deal
          path: 'tale/:username/:taleId?/:taleTitle?',
          name: 'TaleDetail',
          component: () => import('@/features/tales/views/TaleDetailView.vue'),
          props: true // Automatically forwards params into the component as props
        },
        {
          path: 'tales', // Renders at outscribed.com/tales
          name: 'TaleLists',
          component: () => import('@/features/tales/views/TaleListsView.vue')
        },
        {
          path: 'tales/my/:relationType', 
          name: 'MyTaleLists',
          component: () => import('@/features/tales/views/TaleListsView.vue'),
          meta: { requiresAuth: true, authContext: 'my_tales' }
        },
        {
          path: 'tales/:creatorUsername/:relationType', 
          name: 'UserTaleLists',
          component: () => import('@/features/tales/views/TaleListsView.vue')
        },
        {
          path: 'tale/archives/taleId', 
          name: 'ArchivedTaleDetail',
          component: () => import('@/features/tales/views/TaleDetailView.vue'),
          meta: { requiresAuth: true, authContext: 'archived_tales' }
        },
         {
          path: 'tales/editor', // Renders at outscribed.com/tales/editor
          name: 'TaleDrafts',
          component: () => import('@/features/tales/views/TaleDraftsView.vue'),
          meta: { requiresAuth: true, authContext: 'create_tales' }
        },
        {
          path: 'insights', // Renders at outscribed.com/insights
          name: 'InsightLists',
          component: () => import('@/features/insights/views/InsightListsView.vue')
        },
        {
          path: 'insights/my/:relationType', 
          name: 'MyInsightLists',
          component: () => import('@/features/insights/views/InsightListsView.vue'),
          meta: { requiresAuth: true, authContext: 'my_insights' }
        },
        {
          path: 'insights/:creatorUsername/:relationType', 
          name: 'UserInsightLists',
          component: () => import('@/features/insights/views/InsightListsView.vue')
        },
        {
          path: 'insight/archives/insightId', 
          name: 'ArchivedInsightDetail',
          component: () => import('@/features/insights/views/InsightDetailView.vue'),
          meta: { requiresAuth: true, authContext: 'archived_insights' }
        },
         {
          path: 'insights/editor', // Renders at outscribed.com/insights/editor
          name: 'InsightDrafts',
          component: () => import('@/features/insights/views/InsightDraftsView.vue'),
          meta: { requiresAuth: true, authContext: 'create_insights' }
        },
         {
          // Matches: /insight/01KTZD9M
          path: '/insight/:insightId([A-Z0-9]{26})',
          name: 'InsightDetailById',
          component: () => import('@/features/insights/views/InsightDetailView.vue'),
          props: true
        },
        {
          // Matches: /insight/celesteaurora AND /insight/celesteaurora/01KTZD9M/the-art-of-the-deal
          path: '/insight/:username/:insightId?/:insightTitle?',
          name: 'InsightDetail',
          component: () => import('@/features/insights/views/InsightDetailView.vue'),
          props: true // Automatically forwards params into the component as props
        },
        {
          path: 'comments', // Renders at outscribed.com/comments
          name: 'CommentLists',
          component: () => import('@/features/engagements/views/CommentListsView.vue')
        },
         {
          path: 'comments/my/:relationType', 
          name: 'MyComments',
          component: () => import('@/features/engagements/views/CommentListsView.vue'),
          meta: { requiresAuth: true, authContext: 'my_comments' }
        },
        {
          path: 'comments/:creatorUsername/:relationType', 
          name: 'UserComments',
          component: () => import('@/features/engagements/views/CommentListsView.vue')
        },
         {
          path: 'comments/editor', 
          name: 'CommentDrafts',
          component: () => import('@/features/engagements/views/CommentDraftsView.vue'),
          meta: { requiresAuth: true, authContext: 'create_comments' }
        },
        {
          path: 'writers', // Renders at outscribed.com/tales
          name: 'WriterLists',
          component: () => import('@/features/authoring/views/WriterListsView.vue')
        },
        {
          path: 'faqs', // Renders at outscribed.com/tales
          name: 'FaqLists',
          component: () => import('@/features/support/views/FaqListsView.vue')
        },
         {
          path: 'users/my/:relationType', 
          name: 'MyUsers',
          component: () => import('@/features/identity/views/UserListsView.vue'),
          meta: { requiresAuth: true, authContext: 'my_users' }
        },
        {
          path: 'users/:creatorUsername/:relationType', 
          name: 'UserUsers',
          component: () => import('@/features/identity/views/UserListsView.vue')
        }
      ]
    },
    {
      // --- FORM WORKFLOW ROUTE GROUP ---
      path: '/',
      component: FormLayout,
      children: [
        {
          path: 'register', // Renders at outscribed.com/register
          name: 'submit-tale',
          component: () => import('@/features/gatekeeper/views/RegisterView.vue')
        },
        {
          path: 'logout', // Renders at outscribed.com/logout
          name: 'logout',
          component: () => import('@/features/gatekeeper/views/LogoutView.vue')
        },
        {
          path: 'login', // Renders at outscribed.com/login
          name: 'login',
          component: () => import('@/features/gatekeeper/views/LoginView.vue')
        },
        {
          path: 'reset', // Renders at outscribed.com/reset
          name: 'reset-password',
          component: () => import('@/features/gatekeeper/views/ResetView.vue')
        }
      ]
    }
  ]
})

router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || 
      error.message.includes('error loading dynamically imported module')) {
    // Force a reload to grab the newest Vite asset hashes
    window.location.href = to.fullPath;
  }
});

// src/router/index.ts
router.beforeEach((to, from) => {
  const hasUserHint = checkIsLoggedIn()

  if (to.meta.requiresAuth && !hasUserHint) {
    console.warn(`🔒 [Router]: Intercepted navigation to protected resource.`)
    
    // 🎯 Simply RETURN the target route configuration object directly
    return { 
      name: 'login', 
      query: { 
        returnUrl: to.fullPath,
        context: to.meta.authContext as string
      } 
    }
  }

  // 🟢 If authentication passes, returning undefined or true allows navigation to proceed
  return true 
})

export default router