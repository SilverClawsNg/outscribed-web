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

export const AccountStatusClass: Record<AccountStatus, string> = {
  Active: 'info',
  HiddenByModeration: 'warning',
  SuspendedByAdmin: 'warning',
  BannedByAdmin: 'danger',
  SelfArchived: 'warning',
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
    'Tributes that serve as a celebration of character and impact, a reflective keepsake, and a way to honor someone\'s legacy while they are still here to share in it.',

  Reflections:
    'Real life lessons turned into great stories. Advice to our younger selves, second chances, and hard truths that help everyone grow.',

  DoomsDay:
    'Stories about what happens when things fall apart—not to scare us, but to help us build safer, stronger, and smarter systems for the future.',

  PoliticsGovernance:
    'A new look at power, rules, and leaders. Creative ways to fix broken systems, help communities, and make public decisions better for everyone.',

  SportsGaming:
    'Sports and video games with new rules, better teamwork, and fairer play. A playground for how sports and gaming could be more fun and fair.',

  ScienceTechnology:
    'Cool ideas for future tech, AI, space travel, and inventions. Big "what-if" stories about the tools we make and how to use them wisely.',

  Education:
    'New ways to learn, teach, and go to school. Creative ideas for classrooms and skills when old learning styles just do not work anymore.',

  BusinessEconomy:
    'Fresh ideas for money, jobs, and businesses. Stories about better ways to work, trade, and build companies that help people.',

  ArtsEntertainment:
    'A new vision for music, movies, fame, and storytelling. Exploring how creative art could be made and shared in the future.',

  MedicineHealthcare:
    'Better ways to care for the sick and fix health systems. Smart ideas and breakthroughs for doctors, hospitals, and taking care of people.',

  LawOrder:
    'Rules and courts reimagined. Creative stories about justice, protecting rights, and finding fairer ways to fix wrongs.',

  SocietalNormsValues:
    'Re-thinking everyday habits, customs, and how we treat each other. Big questions about how to build kinder, better communities.',

  HistoryCulture:
    'Rewriting history with "what-if" questions. Looking at the past in a new way to help us build a brighter present.',

  EnvironmentClimate:
    'Smart ideas to protect nature, clean up the planet, and fight climate change. Stories about fixing damage and living alongside nature.',

  ReligionSpirituality:
    'Big questions about faith, belief, and meaning. Honest stories about how communities find purpose, hope, and togetherness.',

  FamilyRelationships:
    'Stories about parents, kids, friends, and chosen family. Exploring better ways to communicate, care for each other, and solve conflicts.',

  Miscellaneous:
    'Wild, unusual, and hard-to-classify ideas that do not fit anywhere else—because big new ideas often start in strange places.',
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
  ZZ: 'Global',
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
