// src/components/TimelineActivityDispatcher.ts
import { h, type SetupContext } from 'vue'
import { RouterLink } from 'vue-router'
import type { TimelineDto } from './GlobalTypes'
import { ActivityTypeDescriptions, FlagTypeDescriptions } from '@/utils/descriptors'
import { useModalStore } from '@/stores/modalStore'
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import type { Category, FlagType } from '@/utils/enumHelper'

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

  const getCount = (key: string): string => {
    return t.payload?.[key] || t[key]?.toString() || '0'
  }

  // --- 1. ROUTED LINKS HELPERS (Tales / Insights) ---
  const renderContentLink = (type: 'tale' | 'insight' | 'tag', slugKey: string = 'Slug', titleKey: string = 'Title') => {
    return h(
      RouterLink, 
      { to: `/${type}/${getVal(slugKey)}`, class: 'timeline-link' }, 
      () => getVal(titleKey)
    )
  }

  function isCategory(key: string): key is Category {
  return key in CategoryDescriptions;
}

 function isFlagType(key: string): key is FlagType {
  return key in FlagTypeDescriptions;
}

const renderCategoryLink = (type: 'tales' | 'insights', rawCategory: string) => {

  if (!rawCategory) return '';

    // Safe lookup: if it's a valid category, grab the label; otherwise fallback to raw string
    const label = isCategory(rawCategory) ? CategoryDescriptions[rawCategory] : rawCategory;
    const href = `/${type}?category=${encodeURIComponent(rawCategory)}`;

  //return h('a', { href, class: 'category-link' }, label);
  
    return h(
      RouterLink, 
      { to: href }, 
      () => label
    )
}

const renderModalTrigger = (modalType: string, modalLabel: string, idKey: string, displayLabel: string) => {
      return h(
        'a',
        {
          href: '#',
            onClick: (e: MouseEvent) => {
            e.preventDefault() // <-- Replicates builder.AddEventPreventDefaultAttribute
           
            // 🚀 Direct Testimony: Push straight to the global store layer.
            // No events to listen for or maintain at the parent view level!
            modalStore.push(modalType, modalLabel, idKey)
          }
        },
        displayLabel
      )
}

const renderProfileModalTrigger = (idKey: string, displayLabel: string) => {
      return h(
        'a',
        {
          href: '#',
          class: 'at',
          onClick: (e: MouseEvent) => {
            e.preventDefault() // <-- Replicates builder.AddEventPreventDefaultAttribute
            
            // 🚀 Direct Testimony: Push straight to the global store layer.
            // No events to listen for or maintain at the parent view level!
            modalStore.push('Profile', 'User Profile', idKey)
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
  if (act === 'AccountSelfArchived_Account') {
    return h('p', `You successfully archived your account. Your profile would no longer be visible to other users.`)
  }
  if (act === 'AccountSelfUnarchived_Account') {
    return h('p', `You successfully unarchived your account and your profile is now visible to other users.`)
  }
 if (act === 'AccountSuspensionAppealed_Account') {
    return h('p', `You appealed your account suspension. Appeals are subject to administrative action.`)
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
    const rawCategory = getVal('Category'); // e.g., 'PoliticsGovernance'
    const actionText = act === 'TaleCreated_Tale' ? 'created a new tale, ' : 'published a new tale, '
    return h('p', [
      `You ${actionText}`, 
      renderContentLink('tale'), 
      ` in the category, `, 
      renderCategoryLink('tales', rawCategory),
    '.'
    ])
  }

if (act === 'TaleLaunched') {
  const rawCategory = getVal('Category'); // e.g., 'PoliticsGovernance'

  return h('p', [
    renderModalTrigger('Profile', 'User Profile', getVal('AccountId'), getVal('Username')),
    ' published a new tale, ',
    renderContentLink('tale'),
    ' in the category, ',
    // Render the category link
    renderCategoryLink('tales', rawCategory),
    '.'
  ]);
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
  if (act === 'TaleRealityCheckUpdated_Tale') return h('p', ['You updated the reality check of your tale, ', renderContentLink('tale')])
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
  if (act === 'TaleHasEngagement_Tale') return h('p', ['Your tale, ', renderContentLink('tale'), ' was engaged by the community and may no longer be directly updated or deleted.'])
  if (act === 'TaleCertified_Tale') return h('p', ['Your tale, ', renderContentLink('tale'), ' was reviewed and certified for public viewership.'])
  if (act === 'TaleMilestoned_Tale') {
    return h('p', ['Your tale, ', renderContentLink('tale'), ` has reached a new milestone. 
      Authenticated Views: ${getCount('AuthViewsCount')}, 
      Total Views: ${getCount('ViewsCount')}, 
      Insights: ${getCount('InsightsCount')}, 
      Comments: ${getCount('CommentsCount')}, 
      Replies: ${getCount('RepliesCount')}, 
      Saves: ${getCount('FavoritesCount')}, 
      Upvotes: ${getCount('UpvotesCount')}, 
      Downvotes: ${getCount('DownvotesCount')}, 
      Flags: ${getCount('FlagsCount')}, 
      Shares: ${getCount('SharesCount')}, 
      Total Engagement Score: ${getCount('EngagementScore')}.`])
  }


  // INSIGHTS INTERPOLATION ENGINES
  if (act === 'InsightCreated_Insight' || act === 'InsightLaunched_Insight') {
      const rawCategory = getVal('Category'); // e.g., 'PoliticsGovernance'
    const actionText = act === 'InsightCreated_Insight' ? 'created a new insight, ' : 'published a new insight, '
    return h('p', [
      `You ${actionText}`, 
      renderContentLink('insight'), 
      ` in the category, `, 
      renderCategoryLink('insights', rawCategory),
    '.'
    ])
  }

if (act === 'InsightLaunched') {
  const rawCategory = getVal('Category'); // e.g., 'PoliticsGovernance'

  return h('p', [
    renderModalTrigger('Profile', 'User Profile', getVal('AccountId'), getVal('Username')),
    ' published a new insight, ',
    renderContentLink('insight'),
    ' in the category, ',
    // Render the category link
    renderCategoryLink('insights', rawCategory),
    '.'
  ]);
}
  if (act === 'InsightUpdated_Insight') return h('p', ['You updated the basic details of your insight, ', renderContentLink('insight')])
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
  if (act === 'InsightHasEngagement_Insight') return h('p', ['Your insight, ', renderContentLink('insight'), ' was engaged by the community and may no longer be directly updated or deleted.'])
  if (act === 'InsightMilestoned_Insight') {
    return h('p', ['Your insight, ', renderContentLink('insight'), ` has reached a new milestone. 
      Authenticated Views: ${getCount('AuthViewsCount')}, 
      Total Views: ${getCount('ViewsCount')}, 
      Comments: ${getCount('CommentsCount')}, 
      Replies: ${getCount('RepliesCount')}, 
      Saves: ${getCount('FavoritesCount')}, 
      Upvotes: ${getCount('UpvotesCount')}, 
      Downvotes: ${getCount('DownvotesCount')}, 
      Flags: ${getCount('FlagsCount')}, 
      Shares: ${getCount('SharesCount')}, 
      Total Engagement Score: ${getCount('EngagementScore')}.`])
  }

  // --- 4. COMMENTS AND ENGAGEMENT THREAD ENGINES ---
  if (act === 'Commented_Comment') {
    const targetType = (getVal('ContentType') || 'Content').toLowerCase()

    return h('p', [
      'You posted a new comment, ',
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub'))),
      ` to the ${targetType}, `,
      h(RouterLink, { to: `/${targetType}/${getVal('Slug')}` }, () => getVal('Title'))
    ])
  }

  if (act === 'Replied_Comment') {
    const targetType = (getVal('ContentType') || 'Content').toLowerCase()

    return h('p', [
      'You posted a response, ',
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub'))),
      ' to the ',
      renderModalTrigger('CommentThread', 'Thread', getVal('ParentId'), 'comment'),
      ` on the ${targetType}, `,
      h(RouterLink, { to: `/${targetType}/${getVal('Slug')}` }, () => getVal('Title'))
    ])
  }

   if (act === 'CommentHasEngagement_Comment') {
    return h('p', [
      'Your comment, ',
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub'))),
      ' was engaged by the community and may no longer be directly updated or deleted.'
    ])
  }
   if (act === 'CommentMilestoned_Comment') {
    return h('p', ['Your comment, ', renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub'))), ` has reached a new milestone. 
      Replies: ${getCount('RepliesCount')}, 
      Saves: ${getCount('FavoritesCount')}, 
      Upvotes: ${getCount('UpvotesCount')}, 
      Downvotes: ${getCount('DownvotesCount')}, 
      Flags: ${getCount('FlagsCount')}, 
      Total Engagement Score: ${getCount('EngagementScore')}.`])
  }

  // --- Content Engagements ---
  if (act === 'ContentSavedToFavorites_Engagement') {
    
    const targetType = (getVal('ContentType') || 'Content').toLowerCase()
   
    return h('p', [
      `You saved the ${targetType}, `,
      targetType == 'tale' ? renderContentLink('tale') : targetType == 'insight' ? renderContentLink('insight') :
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub'))),
      ` to your favorites folder.`
    ])
  }

  // --- Content Engagements ---
  if (act === 'ContentFlagged_Engagement') {

    const flagType = getVal('FlagType');
    const targetType = (getVal('ContentType') || 'Content').toLowerCase()
     const label = isFlagType(flagType) ? FlagTypeDescriptions[flagType] : flagType;
   
    return h('p', [
      `You reported the ${targetType}, `,
      targetType == 'tale' ? renderContentLink('tale') : targetType == 'insight' ? renderContentLink('insight') :
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub'))),
      ` for violation '${label}'.`
    ])
  }

   if (act === 'ContentShared_Engagement') {
    
    const targetType = (getVal('ContentType') || 'Content').toLowerCase()
   
    return h('p', [
      `You shared the ${targetType}, `,
      targetType == 'tale' ? renderContentLink('tale') : targetType == 'insight' ? renderContentLink('insight') :
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub')))
    ])
  }

  if (act === 'ContentUpvoted_Engagement' || act === 'ContentDownvoted_Engagement') {
    
    const targetType = (getVal('ContentType') || 'Content').toLowerCase();
    const actionType = act === 'ContentUpvoted_Engagement' ? 'upvoted' : 'downvoted';
   
    return h('p', [
      `You ${actionType} the ${targetType}, `,
      targetType == 'tale' ? renderContentLink('tale') : targetType == 'insight' ? renderContentLink('insight') :
      renderModalTrigger('CommentThread', 'Thread', getVal('CommentId'), (getVal('Stub')))
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