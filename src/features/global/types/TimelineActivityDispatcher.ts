// src/components/TimelineActivityDispatcher.ts
import { h, type SetupContext } from 'vue'
import { RouterLink } from 'vue-router'
import type { TimelineDto } from './GlobalTypes'
import { ActivityTypeDescriptions } from '@/utils/descriptors'
import { useModalStore } from '@/stores/modalStore'

const modalStore = useModalStore()

interface DispatcherProps {
  timeline: TimelineDto
}

export const TimelineActivityDispatcher = (
  props: DispatcherProps,
  { emit }: SetupContext<['open-modal']>
) => {
  const t = props.timeline
  const act = t.activityType

  // Helper to replicate t.GetVal("Key") with payload fallbacks cleanly
  const getVal = (key: string): string => {
    return t.payload?.[key] || t[key]?.toString() || ''
  }

  // --- 1. ROUTED LINKS HELPERS (Tales / Insights) ---
  const renderContentLink = (type: 'tale' | 'insight' | 'tag', slugKey: string = 'Slug', titleKey: string = 'Title') => {
    return h(
      RouterLink, 
      { to: `/${type}/${getVal(slugKey)}`, class: 'timeline-link' }, 
      () => getVal(titleKey)
    )
  }

   const renderModalTrigger = (modalType: string, displayLabel: string, idKey: string) => {
      return h(
        'a',
        {
          href: '#',
          class: 'show-filter timeline-modal-trigger',
          onClick: (e: MouseEvent) => {
            e.preventDefault() // <-- Replicates builder.AddEventPreventDefaultAttribute
            
            // 🚀 Direct Testimony: Push straight to the global store layer.
            // No events to listen for or maintain at the parent view level!
            modalStore.push(modalType, displayLabel, getVal(idKey))
          }
        },
        displayLabel
      )
    }


  // ==========================================
  // MATCH EXECUTION INTERPOLATION TREES
  // ==========================================

  // ACCOUNT CUSTOM ENTRIES
  if (act === 'CreatedAccount_Account') {
    return h('p', `Welcome! You successfully completed your account registration.`)
  }
  if (act === 'LoggedOut_Account') {
    return h('p', `You successfully logged out of your account.`)
  }
  if (act === 'ChangedPassword_Account') {
    return h('p', `You successfully changed your account password.`)
  }
  if (act === 'ResetPassword_Account') {
    return h('p', `You successfully reset your account password.`)
  }
   if (act === 'UpdatedProfile_Account') {
    return h('p', `You successfully updated your profile information.`)
  }
  if (act === 'UpdatedProfilePhoto_Account') {
    return h('p', `You successfully updated your profile photo.`)
  }
  if (act === 'LoggedIn_Account') {
    return h('p', `You logged in from ${getVal('DeviceName')} with IpAddress: ${getVal('IpAddress')}`)
  }
  if (act === 'AddedContact_Account') {
    return h('p', `You added a new ${getVal('ContactType')} contact.`)
  }
  if (act === 'UpdatedContact_Account') {
    return h('p', `You updated your ${getVal('ContactType')} contact details.`)
  }
  if (act === 'AccountBanned_Account' || act === 'AccountSuspended_Account' || act === 'AccountReinstated_Account') {
    const actionText = act === 'AccountBanned_Account' ? 'banned' : act === 'AccountSuspended_Account' ? 'suspended' : 'disabled by an admin'
    return h('p', `Your account has been ${actionText} for the following reasons: ${getVal('Reasons')}.`)
  }
  if (act === 'ModerationApplied_Account') {
    return h('p', `A moderation penalty has been applied to your account. Your current score is: ${getVal('ModerationScore')}. Note that accounts are automatically hidden at multiples of 3 moderation scores.`)
  }
  if (act === 'AccountMilestoned_Account') {
    return h('p', `Your account reached a new milestone. Details: Engagement Score: ${getVal('EngagementScore')}, Total profile views: ${getVal('ViewsCount')}, Authenticated profile views: ${getVal('AuthViewsCount')}, Tales published: ${getVal('TalesCount')}, Insights published: ${getVal('InsightsCount')}, Comments: ${getVal('CommentsCount')}.`)
  }

  // ADMINISTRATIVE PRIVILEGES
  if (act === 'RoleAssigned_Role' || act === 'RoleReassigned_Role') {
    const verb = act === 'RoleAssigned_Role' ? 'assigned to' : 're-assigned to'
    return h('p', `You have been ${verb} a new administrative role: ${getVal('Role')}.`)
  }

  if (act === 'RoleDeactivated_Role') {
    return h('p', `Your administrative privileges has been deactivated.`)
  }
  if (act === 'RoleActivated_Role') {
    return h('p', `Your adminsitrative role has been reactivated.`)
  }

  
  // AUTHORING PRIVILEGES
   
  if (act === 'WriterOnboarded_Authoring') {
    return h('p', `Congratulations. Your writing privilege onboarding was successfully completed and your membership of OutScribed's writers' guild confirmed.`)
  }
  if (act === 'WritingPrivilegeSuspended_Authoring') {
    return h('p', `Your membership of OutScribed's writers' guild has been suspended and you may no longer publish tales. You are expected to contact support if you wish to contest this ban.`)
  }
  if (act === 'WritingPrivilegeReinstated_Authoring') {
    return h('p', `Congratulations. Your membership of OutScribed's writers' guild has been reinstated. You are expected to resume submission of tales.`)
  }

  // TALES LAYOUT ENGINES
  if (act === 'TaleCreated_Tale' || act === 'TaleLaunched_Tale') {
    const actionText = act === 'TaleCreated_Tale' ? 'created a new tale, ' : 'published a new tale, '
    return h('p', [
      `You ${actionText}`, renderContentLink('tale'), ` in the category, ${getVal('Category')}.`
    ])
  }
  if (act === 'TaleLaunched') {
    return h('p', [
      renderModalTrigger('Profile', 'User Profile', getVal('AccountId')),
      ' published a new tale, ',
      renderContentLink('tale'),
      ` in the category, ${getVal('Category')}.`
    ])
  }
  if (act === 'TaleAddendumUpdated_Tale') {
    return h('p', ['You added an addendum to your tale, ', renderContentLink('tale')])
  }
  if (act === 'TaleArchived_Tale') {
    return h('p', `Your tale, ${getVal('Title')} has been archived due to violations of community guidelines.`)
  }
  if (act === 'TaleSelfDeleted_Tale') {
    return h('p', `You deleted your tale, ${getVal('Title')}.`)
  }
  if (act === 'TaleSelfArchived_Tale' || act === 'TaleSelfUnarchived_Tale') {
    const prefix = act === 'TaleSelfArchived_Tale' ? 'archived' : 'unarchived'
    return h('p', [`You ${prefix} your tale, `, renderContentLink('tale')])
  }
  if (act === 'TaleCountryUpdated_Tale') return h('p', ['You updated the target country of your tale, ', renderContentLink('tale')])
  if (act === 'TalePhotoUpdated_Tale') return h('p', ['You updated the central image of your tale, ', renderContentLink('tale')])
  if (act === 'TaleWatchlistUpdated_Tale') return h('p', ['You updated the watchlist of your tale, ', renderContentLink('tale')])
  if (act === 'TaleDetailUpdated_Tale') return h('p', ['You updated the detail of your tale, ', renderContentLink('tale')])
  if (act === 'TaleSummaryUpdated_Tale') return h('p', ['You updated the summary of your tale, ', renderContentLink('tale')])
  if (act === 'TaleUpdated_Tale') return h('p', ['You updated the basic details of your tale, ', renderContentLink('tale')])
  
  if (act === 'TaleTagged_Tale' || act === 'TaleUntagged_Tale') {
    const connection = act === 'TaleTagged_Tale' ? 'to' : 'from'
    const verb = act === 'TaleTagged_Tale' ? 'added a new tag, ' : 'removed the tag, '
    return h('p', [
      `You ${verb}`, renderContentLink('tag', 'TagSlug', 'TagName'), ` ${connection} your tale, `, renderContentLink('tale')
    ])
  }
  if (act === 'TaleSuspended_Tale') return h('p', ['Your tale, ', renderContentLink('tale'), ' was placed under administrative review.'])
  if (act === 'TaleModerated_Tale') return h('p', ['Your tale, ', renderContentLink('tale'), ' was flagged by community moderation and placed under administrative review.'])
  if (act === 'TaleHasEngagement_Tale') return h('p', ['Your tale, ', renderContentLink('tale'), ' was engaged by the community and can no longer be updated.'])
  if (act === 'TaleCertified_Tale') return h('p', ['Your tale, ', renderContentLink('tale'), ' was reviewed and certified for public viewership.'])
  if (act === 'TaleMilestoned_Tale') {
    return h('p', ['Your tale, ', renderContentLink('tale'), ` has reached a new milestone. Score: ${getVal('EngagementScore')}, Views: ${getVal('ViewsCount')}.`])
  }

  // INSIGHTS INTERPOLATION ENGINES
  if (act === 'InsightCreated_Insight' || act === 'InsightLaunched_Insight') {
    const actionText = act === 'InsightCreated_Insight' ? 'created a new Insight, ' : 'published a new Insight, '
    return h('p', [`You ${actionText}`, renderContentLink('insight'), ` in the category, ${getVal('Category')}.`])
  }
  if (act === 'InsightLaunched') {
    return h('p', [
      renderModalTrigger('Profile', 'User Profile', getVal('AccountId')),
      ' published a new Insight, ',
      renderContentLink('insight'),
      ` in the category, ${getVal('Category')}.`
    ])
  }
  if (act === 'InsightUpdated_Insight') return h('p', ['You updated the basic details of your insight, ', renderContentLink('insight')])
  if (act === 'InsightSelfArchived_Insight' || act === 'InsightSelfUnarchived_Insight') {
    const mode = act === 'InsightSelfArchived_Insight' ? 'archived' : 'unarchived'
    return h('p', [`You ${mode} your insight, `, renderContentLink('insight')])
  }
  if (act === 'InsightSummaryUpdated_Insight') return h('p', ['You updated the summary of your insight, ', renderContentLink('insight')])
  if (act === 'InsightDetailUpdated_Insight') return h('p', ['You updated the detail of your insight, ', renderContentLink('insight')])
  if (act === 'InsightCountryUpdated_Insight') return h('p', ['You updated the target country of your insight, ', renderContentLink('insight')])
  if (act === 'InsightPhotoUpdated_Insight') return h('p', ['You updated the central image of your insight, ', renderContentLink('insight')])
  if (act === 'InsightSelfDeleted_Insight') return h('p', `You deleted your insight, ${getVal('Title')}.`)
  if (act === 'InsightArchived_Insight') return h('p', `Your insight, ${getVal('Title')} has been archived due to community guideline violations.`)
  if (act === 'InsightAddendumUpdated_Insight') return h('p', ['You added an addendum to your insight, ', renderContentLink('insight')])
  if (act === 'InsightTagged_Insight' || act === 'InsightUntagged_Insight') {
    const connection = act === 'InsightTagged_Insight' ? 'to' : 'from'
    const verb = act === 'InsightTagged_Insight' ? 'added a new tag, ' : 'removed the tag, '
    return h('p', [
      `You ${verb}`, renderContentLink('tag', 'TagSlug', 'TagName'), ` ${connection} your insight, `, renderContentLink('insight')
    ])
  }
  if (act === 'InsightSuspended_Insight') return h('p', ['Your insight, ', renderContentLink('insight'), ' was placed under administrative review.'])
  if (act === 'InsightModerated_Insight') return h('p', ['Your insight, ', renderContentLink('insight'), ' was flagged by community moderation and placed under review.'])
  if (act === 'InsightCertified_Insight') return h('p', ['Your insight, ', renderContentLink('insight'), ' was reviewed and certified for public viewership.'])
  if (act === 'InsightMilestoned_Insight') return h('p', ['Your insight, ', renderContentLink('insight'), ' has hit a milestone views metrics log accumulation limit.'])

  // --- 4. COMMENTS AND ENGAGEMENT THREAD ENGINES ---
  if (act === 'Commented_Comment' || act === 'Replied_Comment') {
    const actionLabel = act === 'Commented_Comment' ? 'You posted a new comment, ' : 'You posted a response, '
    const targetType = (getVal('ContentType') || 'Content').toLowerCase()
    
    return h('p', [
      actionLabel,
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId')),
      ` to the ${targetType}, `,
      h(RouterLink, { to: `/${targetType}/${getVal('Slug')}` }, () => getVal('Title'))
    ])
  }

  // --- 5. STATIC TEXT ENUMS MAP FALLBACK ---
  const flatFallback = ActivityTypeDescriptions[act]
  if (flatFallback) {
    return h('p', flatFallback)
  }

  // TOTAL SAFETY TRACK OVERFLOW
  return h('p', { class: 'fallback-activity' }, `Activity tracked successfully: [${act}].`)
}

// Wire up the exact typing declaration so parent views get autocomplete mappings
TimelineActivityDispatcher.props = ['timeline']
TimelineActivityDispatcher.emits = ['open-modal']