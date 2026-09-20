import type { ContentType, ActivityType, Category, AccountStatus, ContactType, Country, TaleStatus, InsightStatus,
SortType, GeneralSortType, VoteType, CommentStatus, LimitedContentType, FlagType
 } from '@/utils/enumHelper'
  
  export const VoteTypeDescriptions: Record<VoteType, string> = {
  Upvote: 'Upvote',
  Downvote: 'Downvote',
  None: 'None'
} as const;

  export const SortTypeDescriptions: Record<SortType, string> = {
  MostRecent: 'Newest',
  LeastRecent: 'Oldest',
  MostViewed: 'By Views',
  MostCommented: 'By Comments/Replies',
  MostFlagged: 'By Flags',
  MostUpvoted: 'By Votes',
  MostFavorited: 'By Saves',
  MostShared: 'By Shares'
} as const;
  
  export const GeneralSortTypeDescriptions: Record<GeneralSortType, string> = {
  MostRecent: 'Newest',
  LeastRecent: 'Oldest'
} as const;

export const TaleStatusClass: Record<TaleStatus, string> = {
  Created: 'info',
  LaunchedByCreator: 'info',
  HiddenByModeration: 'warning',
  HiddenByAdmin: 'warning',
   CertifiedByAdmin: 'info',
    ArchivedByAdmin: 'danger',
  LaunchedToArchivedByCreator: 'danger',
   CertifiedToArchivedByCreator: 'danger'
} as const;

export const CommentStatusClass: Record<CommentStatus, string> = {
  Active: 'info',
  HiddenByModeration: 'warning',
  HiddenByAdmin: 'warning',
   CertifiedByAdmin: 'info',
    ArchivedByAdmin: 'danger',
  ActiveToArchivedByCreator: 'danger',
   CertifiedToArchivedByCreator: 'danger'
} as const;

  export const CommentStatusDescriptions: Record<CommentStatus, string> = {
  Active: 'Active',
  HiddenByModeration: 'Hidden',
  HiddenByAdmin: 'Suspended',
  CertifiedByAdmin: 'Certified',
  ArchivedByAdmin: 'Archived By Admin',
  ActiveToArchivedByCreator: 'Active -> Archived By Me',
  CertifiedToArchivedByCreator: 'Certified -> Archived By me'
} as const;

  export const TaleStatusDescriptions: Record<TaleStatus, string> = {
  Created: 'Created',
  LaunchedByCreator: 'Published',
  HiddenByModeration: 'Hidden',
  HiddenByAdmin: 'Suspended',
  CertifiedByAdmin: 'Certified',
  ArchivedByAdmin: 'Archived By Admin',
  LaunchedToArchivedByCreator: 'Active -> Archived By Me',
  CertifiedToArchivedByCreator: 'Archived'
} as const;

  export const InsightStatusDescriptions: Record<InsightStatus, string> = {
  Created: 'Created',
  LaunchedByCreator: 'Published',
  HiddenByModeration: 'Hidden',
  HiddenByAdmin: 'Suspended',
  CertifiedByAdmin: 'Certified',
  ArchivedByAdmin: 'Archived By Admin',
  LaunchedToArchivedByCreator: 'Active -> Archived By Me',
  CertifiedToArchivedByCreator: 'Certified -> Archived By me'
} as const;

export const InsightStatusClass: Record<InsightStatus, string> = {
  Created: 'info',
  LaunchedByCreator: 'info',
  HiddenByModeration: 'warning',
  HiddenByAdmin: 'warning',
  CertifiedByAdmin: 'info',
  ArchivedByAdmin: 'danger',
  LaunchedToArchivedByCreator: 'danger',
  CertifiedToArchivedByCreator: 'danger'
} as const;


  export const ContactTypeDescriptions: Record<ContactType, string> = {
  Email: 'Email',
  Facebook: 'Facebook',
  Twitter: 'Twitter',
  LinkedIn: 'LinkedIn',
  CopyLink: 'Copy Link',
  Instagram: 'Instagram',
  TikTok: 'TikTok',
  WhatsApp: 'Whatsapp',
  Website: 'Website',
  Telephone: 'Phone Number'
} as const;

  export const AccountStatusDescriptions: Record<AccountStatus, string> = {
  Active: 'Active',
  HiddenByModeration: 'Hidden',
  SuspendedByAdmin: 'Suspended',
  BannedByAdmin: 'Banned',
  SelfArchived: 'Self Archived'
} as const;

  export const CategoryDescriptions: Record<Category, string> = {
  Tributuary: 'Tributuary',
  Reflections: 'Reflections',
  DoomsDay: 'Dooms Day',
  PoliticsGovernance: 'Politics & Government',
  SportsGaming: 'Sports & Gaming',
  ScienceTechnology: 'Science & Technology',
  Education: 'Education',
  BusinessEconomy : 'Business & Economy',
  ArtsEntertainment : 'Arts & Entertainment',
  MedicineHealthcare: 'Medicine & Healthcare',
  LawOrder: 'Law & Order',
  SocietalNormsValues: 'Societal Norms & Values',
  HistoryCulture: 'History & Culture',
  EnvironmentClimate : 'Environment & Climate',
  ReligionSpirituality: 'Religion & Spirituality',
  FamilyRelationships: 'Family & Relationships',
  Miscellaneous : 'Miscellaneous'
} as const;

export const CategorySummaries: Record<Category, string> = {
  Tributuary:
    'Imaginative homage to people, legacies, and turning points—tribute in tale form, not a factual obituary. Honors what was in order to ask what still could be built.',

  Reflections:
    'Lived experience rewritten as story: letters to a younger self, hard lessons, and second chances. Private hindsight turned into public insight others can use.',

  DoomsDay:
    'Stress-tests for civilization—collapse scenarios that sharpen what we must protect or redesign. Warnings in service of prevention and better systems, not panic for its own sake.',

  PoliticsGovernance:
    'Power and policy retold so we can reimagine governance, civic tools, and how public decisions get made. Critique aimed at systems and incentives, not spectacle alone.',

  SportsGaming:
    'Competition reimagined—new rules, formats, fairness, and cultures of play on the field and on the screen. A lab for how games might work better.',

  ScienceTechnology:
    'Labs, code, and machines as places to prototype futures. Speculative takes on AI, space, and tools we might build—and the choices that should guide them.',

  Education:
    'Learning redesigned: classrooms, credentials, access, and intellectual growth when the old pathways fail. Tales and insights that ask how we could teach and learn differently.',

  BusinessEconomy:
    'Markets and work rebuilt on the page—alternate incentives, ownership, and enterprise. Economic imagination aimed at models that could actually be tried.',

  ArtsEntertainment:
    'Culture under new light—how stories, music, film, and fame might be made, shared, and valued differently. Creative industries as sites of experiment.',

  MedicineHealthcare:
    'Care rethought: breakthroughs, blind spots, and systems between people and help. Narratives that pressure-test how healing and health infrastructure could improve.',

  LawOrder:
    'Justice systems reimagined—rights, procedure, accountability, and repair. Legal speculation that asks what fairness could look like in practice.',

  SocietalNormsValues:
    'The silent rules of belonging, rewritten. Ethical and cultural experiments that explore how we might live together with different defaults.',

  HistoryCulture:
    'Memory and heritage with the locks off—reframed pasts that illuminate better presents. What-ifs tied to the record, aimed at understanding and renewal.',

  EnvironmentClimate:
    'Ecology as design problem and moral stake. Stories that confront damage while sketching stewardship, adaptation, and how we inhabit the planet differently.',

  ReligionSpirituality:
    'Faith, doubt, and meaning as living practice. Explorations of how communities might hold the sacred—and the questions—with more honesty and depth.',

  FamilyRelationships:
    'Kin and chosen family as the first institutions we invent. Bonds, care, and conflict explored in search of healthier ways to belong to one another.',

  Miscellaneous:
    'Hybrid and hard-to-label experiments that still follow the OutScribed form—odd angles where new ideas often start.',
} as const;

export const ContentTypeDescriptions: Record<ContentType, string> = {
  Account: 'Account',
  Tale: 'Tales',
  Insight: 'Insights',
  Comment: 'Comments',
  Authoring : 'Authoring',
  Role : 'Roles',
  Engagement: 'Engagements'
} as const;


export const LimitedContentTypeDescriptions: Record<LimitedContentType, string> = {
  Tale: 'Tales',
  Insight: 'Insights'
 
} as const;

export const FlagTypeDescriptions: Record<FlagType, string> = {
  Other: 'Other',
  Misinformation: 'Deliberate Misinformation',
  GraphicContent: 'Contains Graphic Content',
  AdvocatesViolence: 'Advocates or Incites Violence',
  HateSpeech : 'Promotes Racism, Sexism, etc.',
  SexualExploitation : 'Promotes Sexual Exploitation',
  ChildAbuse: 'Promotes Abuse of Children'
} as const;

export const ActivityTypeDescriptions: Record<ActivityType, string> = {
 // Account
   CreatedAccount_Account : 'Created Account',
   LoggedIn_Account : 'Logged In',
   LoggedOut_Account : 'Logged Out',
   ChangedPassword_Account : 'Changed password',
   ResetPassword_Account : 'Reset Password',
   UpdatedProfile_Account : 'Updated Profile',
   UpdatedProfilePhoto_Account : 'Updated Profile Photo',
   AddedContact_Account : 'Added Contact',
   UpdatedContact_Account : 'Updated Contact',
   AccountBanned_Account : 'Account Banned',
   AccountReinstated_Account : 'Account Reinstated',
   AccountSuspended_Account : 'Account Suspended',
   AccountModerated_Account : 'Account Community Suspended',
   ModerationApplied_Account : 'Modeartion Applied',
   AccountMilestoned_Account : 'Milestone Reached',
   AccountSelfArchived_Account: 'Account Self Archived',
   AccountSelfUnarchived_Account: 'Account Self Unarchived',
    AccountSuspensionAppealed_Account: 'Account Suspension Appealed',

  // Role
   RoleAssigned_Role : 'Role Assigned',
   RoleReassigned_Role : 'Role Reassigned',
   RoleDeactivated_Role : 'Role Deactivated',
   RoleActivated_Role : 'Role Activated',

  // Writer
   WriterOnboarded_Authoring : 'Writing Onboarded',
   WritingPrivilegeSuspended_Authoring : 'Writing Privilege Suspended',
   WritingPrivilegeReinstated_Authoring : 'Writing Privilege Reinstated',

  // Tale
   TaleCreated_Tale : 'Tale Created',
   TaleLaunched_Tale : 'Tale Published',
   TaleLaunched : 'Tale Published',
   TaleUpdated_Tale : 'Tale Updated',
   TaleSelfDeleted_Tale : 'Tale Deleted',
   TaleSelfArchived_Tale : 'Tale Self Archived',
   TaleSelfUnarchived_Tale : 'Tale Self Unarchived',
   TaleSummaryUpdated_Tale : 'Tale Sumamry Updated',
   TaleDetailUpdated_Tale : 'Tale Details Updated',
   TaleCountryUpdated_Tale : 'Tale Country Updated',
   TaleRealityCheckUpdated_Tale : 'Tale Watchlist Updated',
   TalePhotoUpdated_Tale : 'Tale Photo Updated',
   TaleSuspended_Tale : 'Tale Admin Suspended',
   TaleModerated_Tale : 'Tale Community Suspended',
   TaleHasEngagement_Tale : 'Tale Engaged',
   TaleArchived_Tale : 'Tale Admin Archived',
   TaleAddendumUpdated_Tale : 'Tale Addendum Updated',
   TaleTagged_Tale : 'Tale Tagged',
   TaleUntagged_Tale : 'Tale Untagged',
   TaleCertified_Tale : 'Tale Certified',
   TaleMilestoned_Tale : 'Tale Milestoned',

  // Insight
   InsightCreated_Insight : 'Insight Created',
   InsightLaunched_Insight : 'Insight Published',
   InsightLaunched : 'Insight Published',
   InsightUpdated_Insight : 'Insight Updated',
   InsightSelfArchived_Insight : 'Insight Self Archived',
   InsightSelfUnarchived_Insight : 'Insight Self Unarchived',
   InsightSummaryUpdated_Insight : 'Insight Summary Updated',
   InsightDetailUpdated_Insight : 'Insight Details Updated',
   InsightCountryUpdated_Insight : 'Insight Country Updated',
   InsightPhotoUpdated_Insight : 'Insight Photo Updated',
   InsightArchived_Insight : 'Insight Admin Archived',
   InsightAddendumUpdated_Insight : 'Insight Addendum Updated',
   InsightTagged_Insight : 'Insight Tagged',
   InsightUntagged_Insight : 'Insight Untagged',
   InsightSelfDeleted_Insight : 'Insight Deleted',
   InsightCertified_Insight : 'Insight Certfiied',
   InsightSuspended_Insight : 'Insight Admin Suspended',
   InsightModerated_Insight : 'Insight Community Suspended',
   InsightMilestoned_Insight : 'Insight Milestoned',
   InsightHasEngagement_Insight: 'Insight Engaged',

  // Comment
   Commented_Comment : 'Commented',
   Replied_Comment : 'Replied',
   CommentSelfDeleted_Comment : 'Comment Deleted',
   CommentSelfArchived_Comment : 'Comment Self Archived',
   CommentSuspended_Comment : 'Comment Admin Suspended',
   CommentModerated_Comment : 'Comment Community Suspended',
   CommentArchived_Comment : 'Comment Admin Archived',
   CommentCertified_Comment : 'Comment Certified',
   CommentAddendumUpdated_Comment : 'Comment Addendum Updated',
   CommentUpdated_Comment : 'Comment Updated',
   CommentMilestoned_Comment : 'Comment Milestoned',
   CommentHasEngagement_Comment: 'Comment Engaged',

  // Engagement
   ContentSavedToFavorites_Engagement : 'Content Saved To Favorites',
   ContentFlagged_Engagement : 'Content Flagged',
   ContentShared_Engagement : 'Content Shared',
   ContentUpvoted_Engagement : 'Content Upvoted',
   ContentDownvoted_Engagement : 'Content Downvoted',

} as const;

// Mapping from code → description
export const CountryDescriptions: Record<Country, string> = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  AD: 'Andorra',
  AO: 'Angola',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BT: 'Bhutan',
  BO: 'Bolivia',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BR: 'Brazil',
  BN: 'Brunei',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  CV: 'Cabo Verde',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CO: 'Colombia',
  KM: 'Comoros',
  CD: 'Congo (Democratic Republic)',
  CG: 'Congo (Republic)',
  CR: 'Costa Rica',
  HR: 'Croatia',
  CU: 'Cuba',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  SZ: 'Eswatini',
  ET: 'Ethiopia',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GR: 'Greece',
  GD: 'Grenada',
  GT: 'Guatemala',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HN: 'Honduras',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran',
  IQ: 'Iraq',
  IE: 'Ireland',
  IL: 'Israel',
  IT: 'Italy',
  CI: 'Ivory Coast',
  JM: 'Jamaica',
  JP: 'Japan',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: 'Korea (North)',
  KR: 'Korea (South)',
  XK: 'Kosovo',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: 'Laos',
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MR: 'Mauritania',
  MU: 'Mauritius',
  MX: 'Mexico',
  FM: 'Micronesia',
  MD: 'Moldova',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  MK: 'North Macedonia',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestine',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PL: 'Poland',
  PT: 'Portugal',
  QA: 'Qatar',
  RO: 'Romania',
  RU: 'Russia',
  RW: 'Rwanda',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  SS: 'South Sudan',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Suriname',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syria',
  TW: 'Taiwan',
  TJ: 'Tajikistan',
  TZ: 'Tanzania',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States of America',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VA: 'Vatican City',
  VE: 'Venezuela',
  VN: 'Vietnam',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe'
} as const
