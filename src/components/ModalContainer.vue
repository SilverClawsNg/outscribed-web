<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'

// 1. Structural Imports - Forms & Modals mapped precisely to your architectural directories
import AuthenticateModal from '@/features/gatekeeper/modals/AuthenticateModal.vue'
import ResetModal from '@/features/gatekeeper/modals/ResetModal.vue'
import UpdateContactModal from '@/features/identity/modals/UpdateContactModal.vue'
import UpdateProfileModal from '@/features/identity/modals/UpdateProfileModal.vue'
import ChangePasswordModal from '@/features/identity/modals/ChangePasswordModal.vue'
import ArchiveProfileModal from '@/features/identity/modals/ArchiveProfileModal.vue'
import UnarchiveProfileModal from '@/features/identity/modals/UnarchiveProfileModal.vue'
import AppealSuspensionModal from '@/features/identity/modals/AppealSuspensionModal.vue'
import ProfileModal from '@/features/identity/modals/ProfileModal.vue'
import TimelineFilterModal from '@/features/global/modals/TimelineFilterModal.vue'
import StructuralAttestationModal from '@/features/authoring/modals/StructuralAttestationModal.vue'
import LiabilityAttestationModal from '@/features/authoring/modals/LiabilityAttestationModal.vue'
import WriterOnboardingModal from '@/features/authoring/modals/WriterOnboardingModal.vue'
import CreateTaleModal from '@/features/tales/modals/CreateTaleModal.vue'
import UpdateTaleDetailModal from '@/features/tales/modals/UpdateTaleDetailModal.vue'
import UpdateTaleModal from '@/features/tales/modals/UpdateTaleModal.vue'
import UpdateTaleCountryModal from '@/features/tales/modals/UpdateTaleCountryModal.vue'
import UpdateTaleRealityCheckModal from '@/features/tales/modals/UpdateTaleRealityCheckModal.vue'
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

import ContentCommentsModal from '@/features/engagements/modals/ContentCommentsModal.vue'
import CreateCommentModal from '@/features/engagements/modals/CreateCommentModal.vue'
import CommentThreadModal from '@/features/engagements/modals/CommentThreadModal.vue'
import CommentRepliesModal from '@/features/engagements/modals/CommentRepliesModal.vue'
import ReplyCommentModal from '@/features/engagements/modals/ReplyCommentModal.vue'
import CommentListFilterModal from '@/features/engagements/modals/CommentListFilterModal.vue'
import ContentVotesModal from '@/features/engagements/modals/ContentVotesModal.vue'
import CommentStatsModal from '@/features/engagements/modals/CommentStatsModal.vue'
import SnapshotDetailModal from '@/features/engagements/modals/SnapshotDetailModal.vue'
import SnapshotListModal from '@/features/engagements/modals/SnapshotListModal.vue'

import ContentCommentsFilterModal from '@/features/engagements/modals/ContentCommentsFilterModal.vue'
import DraftCommentsFilterModal from '@/features/engagements/modals/DraftCommentsFilterModal.vue'
import EngagementCommentsFilterModal from '@/features/engagements/modals/CommentListFilterModal.vue'

import FlagContentModal from '@/features/engagements/modals/FlagContentModal.vue'

import SearchModal from '@/features/global/modals/SearchModal.vue'
import TagDetailModal from '@/features/global/modals/TagDetailModal.vue'

import ProblemDefinitionModal from '@/features/support/modals/ProblemDefinitionModal.vue'
import TaleDisclaimerModal from '@/features/tales/modals/TaleDisclaimerModal.vue'

import DeleteCommentModal from '@/features/engagements/modals/DeleteCommentModal.vue'
import ArchiveCommentModal from '@/features/engagements/modals/ArchiveCommentModal.vue'
import UpdateCommentModal from '@/features/engagements/modals/UpdateCommentModal.vue'
import UpdateCommentAddendumModal from '@/features/engagements/modals/UpdateCommentAddendumModal.vue'

import WriterFilterModal from '@/features/authoring/modals/WriterFilterModal.vue'
import HelpTopicsModal from '@/features/support/modals/HelpTopicsModal.vue'

import UserListFilterModal from '@/features/identity/modals/UserListFilterModal.vue'

const modalStore = useModalStore()
const isExpandModal = ref(false)

// 2. Dynamic Component Dictionary Map (Replaces the large C# @switch block)
const componentMap: Record<string, any> = {
  Authenticate: AuthenticateModal,
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
  UpdateTaleRealityCheck: UpdateTaleRealityCheckModal,
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
 
ContentComments: ContentCommentsModal,
CreateComment: CreateCommentModal,
CommentListFilter: CommentListFilterModal,
ContentVotes: ContentVotesModal,
CommentStats: CommentStatsModal,
CommentThread: CommentThreadModal,
CommentReplies: CommentRepliesModal,
ReplyComment: ReplyCommentModal,
ContentCommentsFilter: ContentCommentsFilterModal,
DraftCommentsFilter: DraftCommentsFilterModal,
EngagementCommentsFilter: EngagementCommentsFilterModal,
Search: SearchModal,
TagDetail: TagDetailModal,
FlagContent: FlagContentModal,
ProblemDefinition: ProblemDefinitionModal,
TaleDisclaimer: TaleDisclaimerModal,
SnapshotDetail: SnapshotDetailModal,
SnapshotListModal: SnapshotListModal,
WriterFilter: WriterFilterModal,
ArchiveProfile: ArchiveProfileModal,
UnarchiveProfile: UnarchiveProfileModal,
AppealSuspension: AppealSuspensionModal,
DeleteComment: DeleteCommentModal,
ArchiveComment: ArchiveCommentModal,
UpdateComment: UpdateCommentModal,
UpdateCommentAddendum: UpdateCommentAddendumModal,
HelpTopics: HelpTopicsModal,
UserListFilter: UserListFilterModal
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
          
          <!-- 🎯 1. STANDARD HEADER LAYOUT -->
          <div v-if="windowItem.headerType !== 'editor'" class="modal-header">
            <div class="inner-modal-header">
              <button class="close" @click="modalStore.closeAll()">
                &larr;
                <span>{{ windowItem.title }}</span>
              </button>

              <div class="modal-header-menu">
                <button 
                  :class="isExpandModal ? 'maximize' : 'minimize'" 
                  @click="isExpandModal = !isExpandModal"
                >
                  <SvgIcons :name="isExpandModal ? 'maximize' : 'minimize'" />
                </button>

                <button class="close" @click="modalStore.cancel()">
                  X
                </button>
              </div>
            </div>
          </div>

          <!-- 🎯 2. RICH TEXT EDITOR HEADER LAYOUT -->
          <div v-else class="modal-header modal-header--editor">
            <div class="inner-modal-header inner-modal-header--editor">
              <!-- Quick Close All -->
              <button class="close-btn" @click="modalStore.cancel()" title="Close">
                 <!--<SvgIcons name="close" />  -->
                 X
              </button>

              <!-- Dynamic Mount Container for Quill Snow Formatting Bar -->
              <div 
                :id="`modal-header-toolbar-${windowItem.id}`" 
                class="editor-toolbar-slot"
              ></div>

              <!-- Mount Slot for Rich Text Submit Action -->
              <div 
                :id="`modal-header-submit-${windowItem.id}`" 
                class="editor-submit-slot"
              ></div>
            </div>
          </div>

          <!-- MODAL BODY -->
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
@import "../assets/css/modal.less";
</style>