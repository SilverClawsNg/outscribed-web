<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'

// 1. Structural Imports - Forms & Modals mapped precisely to your architectural directories
import LoginModal from '@/features/gatekeeper/modals/LoginModal.vue'
import RegisterModal from '@/features/gatekeeper/modals/RegisterModal.vue'
import ResetModal from '@/features/gatekeeper/modals/ResetModal.vue'
import UpdateContactModal from '@/features/identity/modals/UpdateContactModal.vue'
import UpdateProfileModal from '@/features/identity/modals/UpdateProfileModal.vue'
import ChangePasswordModal from '@/features/identity/modals/ChangePasswordModal.vue'
import ProfileModal from '@/features/identity/modals/ProfileModal.vue'
import TimelineFilterModal from '@/features/global/modals/TimelineFilterModal.vue'
import StructuralAttestationModal from '@/features/authoring/modals/StructuralAttestationModal.vue'
import LiabilityAttestationModal from '@/features/authoring/modals/LiabilityAttestationModal.vue'
import WriterOnboardingModal from '@/features/authoring/modals/WriterOnboardingModal.vue'
import CreateTaleModal from '@/features/tales/modals/CreateTaleModal.vue'
import UpdateTaleDetailModal from '@/features/tales/modals/UpdateTaleDetailModal.vue'
import UpdateTaleModal from '@/features/tales/modals/UpdateTaleModal.vue'
import UpdateTaleCountryModal from '@/features/tales/modals/UpdateTaleCountryModal.vue'
import UpdateTaleWatchlistModal from '@/features/tales/modals/UpdateTaleWatchlistModal.vue'
import UpdateTaleSummaryModal from '@/features/tales/modals/UpdateTaleSummaryModal.vue'
import UpdateTaleTagsModal from '@/features/tales/modals/UpdateTaleTagsModal.vue'
import UpdateTaleAddendumModal from '@/features/tales/modals/UpdateTaleAddendumModal.vue'
import UpdateTalePhotoModal from '@/features/tales/modals/UpdateTalePhotoModal.vue'
import LaunchTaleModal from '@/features/tales/modals/LaunchTaleModal.vue'
import DeleteTaleModal from '@/features/tales/modals/DeleteTaleModal.vue'
import ArchiveTaleModal from '@/features/tales/modals/ArchiveTaleModal.vue'
import UnarchiveTaleModal from '@/features/tales/modals/UnarchiveTaleModal.vue'
import TaleDraftFilterModal from '@/features/tales/modals/TaleDraftFilterModal.vue'
import TaleListFilterModal from '@/features/tales/modals/TaleListFilterModal.vue'
import TaleStatsModal from '@/features/tales/modals/TaleStatsModal.vue'
import TalePreviewModal from '@/features/tales/modals/TalePreviewModal.vue'

import CreateInsightModal from '@/features/insights/modals/CreateInsightModal.vue'
import UpdateInsightDetailModal from '@/features/insights/modals/UpdateInsightDetailModal.vue'
import UpdateInsightModal from '@/features/insights/modals/UpdateInsightModal.vue'
import UpdateInsightCountryModal from '@/features/insights/modals/UpdateInsightCountryModal.vue'
import UpdateInsightSummaryModal from '@/features/insights/modals/UpdateInsightSummaryModal.vue'
import UpdateInsightTagsModal from '@/features/insights/modals/UpdateInsightTagsModal.vue'
import UpdateInsightAddendumModal from '@/features/insights/modals/UpdateInsightAddendumModal.vue'
import UpdateInsightPhotoModal from '@/features/insights/modals/UpdateInsightPhotoModal.vue'
import LaunchInsightModal from '@/features/insights/modals/LaunchInsightModal.vue'
import DeleteInsightModal from '@/features/insights/modals/DeleteInsightModal.vue'
import ArchiveInsightModal from '@/features/insights/modals/ArchiveInsightModal.vue'
import UnarchiveInsightModal from '@/features/insights/modals/UnarchiveInsightModal.vue'
import InsightDraftFilterModal from '@/features/insights/modals/InsightDraftFilterModal.vue'
import InsightListFilterModal from '@/features/insights/modals/InsightListFilterModal.vue'
import InsightStatsModal from '@/features/insights/modals/InsightStatsModal.vue'
import InsightPreviewModal from '@/features/insights/modals/InsightPreviewModal.vue'

import ContentCommentsModal from '@/features/engagements/modals/ContentCommentsModal.vue'
import CreateCommentModal from '@/features/engagements/modals/CreateCommentModal.vue'
import CommentModal from '@/features/engagements/modals/CommentModal.vue'
import CommentThreadModal from '@/features/engagements/modals/CommentThreadModal.vue'
import CommentRepliesModal from '@/features/engagements/modals/CommentRepliesModal.vue'
import ReplyCommentModal from '@/features/engagements/modals/ReplyCommentModal.vue'

import ContentCommentsFilterModal from '@/features/engagements/modals/ContentCommentsFilterModal.vue'
import DraftCommentsFilterModal from '@/features/engagements/modals/DraftCommentsFilterModal.vue'
import EngagementCommentsFilterModal from '@/features/engagements/modals/EngagementCommentsFilterModal.vue'

import FlagContentModal from '@/features/engagements/modals/FlagContentModal.vue'

import SearchModal from '@/features/global/modals/SearchModal.vue'

import FaqListFilterModal from '@/features/support/modals/FaqListFilterModal.vue'
import AskQuestionModal from '@/features/support/modals/AskQuestionModal.vue'
import ProblemDefinitionModal from '@/features/support/modals/ProblemDefinitionModal.vue'

const modalStore = useModalStore()
const isExpandModal = ref(false)

// 2. Dynamic Component Dictionary Map (Replaces the large C# @switch block)
const componentMap: Record<string, any> = {
  LoginUser: LoginModal,
  RegisterUser: RegisterModal,
  ResetPassword: ResetModal,
  UpdateContact: UpdateContactModal,
  UpdateProfile: UpdateProfileModal,
  ChangePassword: ChangePasswordModal,
  Profile:ProfileModal,
  TimelineFilter: TimelineFilterModal,
  StructuralAttestation: StructuralAttestationModal,
  LiabilityAttestation: LiabilityAttestationModal,
  WriterOnboarding: WriterOnboardingModal,
    CreateTale: CreateTaleModal,
  UpdateTaleDetail: UpdateTaleDetailModal,
  UpdateTale: UpdateTaleModal,
  UpdateTaleSummary: UpdateTaleSummaryModal,
  UpdateTaleCountry: UpdateTaleCountryModal,
  UpdateTaleWatchlist: UpdateTaleWatchlistModal,
UpdateTaleTags: UpdateTaleTagsModal,
UpdateTaleAddendum: UpdateTaleAddendumModal,
UpdateTalePhoto: UpdateTalePhotoModal,
LaunchTale : LaunchTaleModal,
DeleteTale: DeleteTaleModal,
ArchiveTale: ArchiveTaleModal,
UnarchiveTale: UnarchiveTaleModal,
TaleDraftFilter: TaleDraftFilterModal,
TaleListFilter: TaleListFilterModal,
TaleStats: TaleStatsModal,
TalePreview: TalePreviewModal,
 CreateInsight: CreateInsightModal,
  UpdateInsightDetail: UpdateInsightDetailModal,
  UpdateInsight: UpdateInsightModal,
  UpdateInsightSummary: UpdateInsightSummaryModal,
  UpdateInsightCountry: UpdateInsightCountryModal,
UpdateInsightTags: UpdateInsightTagsModal,
UpdateInsightAddendum: UpdateInsightAddendumModal,
UpdateInsightPhoto: UpdateInsightPhotoModal,
LaunchInsight : LaunchInsightModal,
DeleteInsight: DeleteInsightModal,
ArchiveInsight: ArchiveInsightModal,
UnarchiveInsight: UnarchiveInsightModal,
InsightDraftFilter: InsightDraftFilterModal,
InsightListFilter: InsightListFilterModal,
InsightStats: InsightStatsModal,
InsightPreview: InsightPreviewModal,
ContentComments: ContentCommentsModal,
CreateComment: CreateCommentModal,
Comment: CommentModal,
CommentThread: CommentThreadModal,
CommentReplies: CommentRepliesModal,
ReplyComment: ReplyCommentModal,
ContentCommentsFilter: ContentCommentsFilterModal,
DraftCommentsFilter: DraftCommentsFilterModal,
EngagementCommentsFilter: EngagementCommentsFilterModal,
Search: SearchModal,
FlagContent: FlagContentModal,
FaqListFilter: FaqListFilterModal,
AskQuestion: AskQuestionModal,
ProblemDefinition: ProblemDefinitionModal
}

// Helper getter to deliver the raw payload directly without flattening
function getComponentProps(windowItem: any) {
  // Always returns a stable, consistent root prop wrapper
  return {
    payload: windowItem.payload ?? null
  }
}

// 3. Coordinate CSS Transition Frames with the Pinia State Manager
async function onAnimationEnd(windowItem: any) {
  // Clear enter flag after entrance finishes
  if (windowItem.isEntering && !windowItem.isLeaving) {
    windowItem.isEntering = false
    return
  }

  // Only purge instance state records from the stack collection array after fade transitions complete
  if (windowItem.isLeaving) {
    modalStore.remove(windowItem)
  }
}
</script>

<template>

  <div id="modal" :class="{ open: modalStore.isOpen }">
    
    <div 
      class="close-modal-wrapper" 
      :class="{ active: modalStore.isContainerOpen }"
      @click="modalStore.closeAll()"
    ></div>

    <div class="inner-modal" :class="{ expand: isExpandModal }">
      
      <template v-if="modalStore.modalStack.length > 0">
        <div 
          v-for="(windowItem, index) in modalStore.modalStack" 
          :key="windowItem.id"
          class="modal-contents"
          :class="{
            'leave': windowItem.isLeaving,
            'enter top': windowItem.isEntering && index === 0,
            'top': !windowItem.isEntering && !windowItem.isLeaving && index === 0,
            'background': index > 0
          }"
          :style="{ zIndex: 1000 + modalStore.stackDepth - index }"
          @animationend="onAnimationEnd(windowItem)"
        >
          
          <div class="modal-header">
            <div class="inner-modal-header">
              
              <button class="close" @click="modalStore.closeAll()">
                <SvgIcons name="back-arrow" />
                <span>{{ windowItem.title }}</span>
              </button>

              <div class="modal-header-menu">
                <button 
                  :class="isExpandModal ? 'maximize' : 'minimize'" 
                  @click="isExpandModal = !isExpandModal"
                >
                  <SvgIcons :name="isExpandModal ? 'maximize' : 'minimize'" />
                </button>

                <button class="close" @click="modalStore.cancel()">X</button>
              </div>

            </div>
          </div>

          <div class="modal-body">
            <div class="inner-modal-body">
              
              <component 
                :is="componentMap[windowItem.type] || componentMap['ModalError']"
                v-bind="getComponentProps(windowItem)"
                @success="windowItem.onSuccessCallback ? windowItem.onSuccessCallback() : null"
              />

              <p class="buffer"></p>
            </div>
          </div>

        </div>
      </template>

    </div>
  </div>
</template>

<style lang="less" scoped>
/* Scoped less styling configurations mapping directly onto your standard layout keys */
@import "../assets/css/modal.less";
</style>