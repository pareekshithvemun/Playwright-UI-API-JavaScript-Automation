// create user api headers

function postCallheaders(token, contentType) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
  };
}

function createUserHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

//token generation api header

function tokenGeneratorApiHeader(contentType) {
  let headers = {
    "Content-Type": contentType,
  };
  return headers;
}

// create attribute headers
function attributeCreateapiHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function audienceCreateapiHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getallLicencePoolHeaders(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function addlicencePoolHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function createChildSiteHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getValuesOfListAttriHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function createAssignmentHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function customiseAreaHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function customiseSubjHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function customChannelHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getChannelFromOrgHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getChannelInfoHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function addContentToChannelHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function stripgenerationHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function publishChannelorJourneyHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getAreasOfOrgHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function createPlayListHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addContentToPlayListHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getplayListHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function createJourneyHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllJourneyHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addIntroToJourneyHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addTrackToJourneyHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addRelatedContenetToJourneyHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function saveInterestOfUserHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addAudienceToJourney(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllUsersHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getJourneyInfoHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function deletetrackHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function retireChannelHeader(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function deleteChannelHeader(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function deleteAreaHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getAllBannerHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllStripHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllAudienceHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllBusinessObjectivHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function cancelAssignmentHeader(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function deleteAssignmentHeader(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getAllInterestsOfUserHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllAssignmentsHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function deleteBannerHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function deleteStripHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function postDataTopSearchedTerms(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getcontentUUIDsHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function grantContentCompletionHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getCourseuuidListHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function extractQAapiHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getBMQuestionBankHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getBMQuestionsHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function contentConsumptionHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getvideoIdFromCourseIdHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function activityDashBoardHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function orgSettingsHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function startBMAssessmentHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function submitChallengeHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getSubmissionHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getAllAttributesHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getSingleAssignmentHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getLocationsForIltHeaders(token, contentType = "application/json") {
  return postCallheaders(token, contentType);
}

function getClassRoomsForIltHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function publishDynamicContentHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function addAttributeValuetoAttributes(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function editAdminUserHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function createTestHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function getCourseQandAHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addUserProfileHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function rateAssetHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function deletePlayListHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function createLinkedContentPayloadHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function publishlinkedContentHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function userGoalsHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function contentLaunchEventHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function achievementsDataHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function searchContentHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function createLiveCourseHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function createLocationHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function createClassroomHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function createLiveClassHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function publishLiveCourseHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function editAssignmentHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function saveQuestionHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function getContainerViewHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function createDynamicContentHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
function saveContainerHeader(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function publishContainerHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addContentToDCHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function addAudienceToDynamicContentHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function fetchContentUUIDHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function createContentConfigHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function completionCriteriaDefaultsHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getOrgRiskAreasHeaders(token, contentType) {
  return postCallheaders(token, contentType);
}

function updateRiskAreaSequenceHeaders(token, contentType) {
  return postCallheaders(token, contentType);
}

function getContentConfigExternalIdHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getContentConfigTopicsHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function publishContentConfigHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function draftContentConfigHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getAllContentItemsHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function createLearningProgramHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function getLearningProgramBusineesObjectiveHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function getAllLearingProgramHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function deleteLearningProgramHeader(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function archiveLearningProgramHeader(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function createLearningProgramBusineesObjectiveHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function getAudienceUsersHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function createCertificationPathHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function getCertificationSubjectsHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function patchSubjectstoCertificationPath(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function retireCertificationPathHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function getPrimaryJobRolesHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function getAspirationJobRolesHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function setPrimaryJobRoleHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}
export function setAspirationJobRoleHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function userFocusSkillsHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function rateSkillHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function createStudyGroupHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function getStudyGroupShareLinkHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function featureTrackingEventForPlaylistHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

export function generateJwtTokenHeaders(token) {
  return {
    "Content-Type": "application/json",
    "percipio-id-token": token, // pass JWT dynamically
  };
}

function aiCoachLearnerHeaders(token) {
  return {
    "Content-Type": "application/json",
    "percipio-id-token": token,
    locale: "en-US",
  };
}

function aiCoachChatStreamHeaders(token) {
  return {
    ...aiCoachLearnerHeaders(token),
    Accept: "text/event-stream",
  };
}

export function aiAssistantHeaders(token, contentType, jwt) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
    jwt: jwt,
    "percipio-id-token": token,
  };
}

export function lxStudioGraphqlHeaders(token, contentType) {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function caisyPresentationsGraphqlHeaders(token, contentType = "") {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function createProjectInWorkspaceHeaders(token, contentType) {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function aiSimulatorGraphqlHeaders(token, contentType) {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

// AI Content Gen Headers
export function aiContentGenGetAvailableTemplatesHeaders(token, contentId) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "percipio-id-token": token,
    "x-content-id": contentId,
  };
}

export function aiContentGenStreamChatHeaders(token, contentId) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "percipio-id-token": token,
    "x-content-id": contentId,
  };
}

export function aiContentGenContentMetadataHeaders(token, contentId) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "percipio-id-token": token,
    "x-content-id": contentId,
  };
}

// LX Studio Assessment Headers
export function lxAssessmentCreateHeaders(token, contentType) {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function lxAssessmentSaveLearningObjectiveHeaders(token, contentType) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function lxAssessmentGenerateDescriptionHeaders(token, contentType) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function lxAssessmentAsyncQuestionGenerationHeaders(token, contentType) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function lxAssessmentAsyncQuestionGenerationStatusHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json, text/plain, */*",
    "percipio-id-token": token,
  };
}

export function lxAssessmentSaveRecommendationsHeaders(token, contentType) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

export function lxAssessmentSearchContentHeaders(
  token,
  contentType,
  orgId,
  userId,
) {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
    "x-sks-org-id": orgId,
    "x-sks-user-id": userId,
  };
}

export function lxAssessmentSkillsHeaders(token, contentType) {
  return {
    "Content-Type": contentType,
    "percipio-id-token": token,
  };
}

function saveCustomLandingPageHeaders(token, contentType) {
  let headers = postCallheaders(token, contentType);
  return headers;
}

function fetchAllCustomLandingPagesHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

function deleteCustomLandingPageHeaders(token) {
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

export let headerData = {
  createAssignmentHeaders,
  getAllUsersHeaders,
  createUserHeader,
  tokenGeneratorApiHeader,
  attributeCreateapiHeaders,
  audienceCreateapiHeaders,
  getallLicencePoolHeaders,
  addlicencePoolHeaders,
  createChildSiteHeaders,
  getValuesOfListAttriHeaders,
  customiseAreaHeaders,
  customiseSubjHeaders,
  customChannelHeaders,
  getChannelFromOrgHeaders,
  getChannelInfoHeaders,
  addContentToChannelHeaders,
  publishChannelorJourneyHeaders,
  getAreasOfOrgHeaders,
  stripgenerationHeaders,
  createPlayListHeaders,
  addContentToPlayListHeaders,
  getplayListHeaders,
  addAudienceToJourney,
  createJourneyHeaders,
  getAllJourneyHeaders,
  addIntroToJourneyHeaders,
  addTrackToJourneyHeaders,
  addRelatedContenetToJourneyHeaders,
  grantContentCompletionHeaders,
  getJourneyInfoHeaders,
  deletetrackHeaders,
  retireChannelHeader,
  deleteChannelHeader,
  deleteAreaHeaders,
  getAllBannerHeaders,
  getAllStripHeaders,
  deleteBannerHeaders,
  deleteStripHeaders,
  postDataTopSearchedTerms,
  getAllAudienceHeaders,
  getAllBusinessObjectivHeaders,
  getAllInterestsOfUserHeaders,
  getAllAssignmentsHeader,
  cancelAssignmentHeader,
  deleteAssignmentHeader,
  getCourseuuidListHeaders,
  extractQAapiHeaders,
  getBMQuestionBankHeaders,
  getBMQuestionsHeaders,
  startBMAssessmentHeaders,
  getcontentUUIDsHeader,
  submitChallengeHeaders,
  getSubmissionHeaders,
  contentConsumptionHeaders,
  activityDashBoardHeaders,
  getvideoIdFromCourseIdHeaders,
  getAllAttributesHeaders,
  getSingleAssignmentHeaders,
  saveInterestOfUserHeaders,
  orgSettingsHeaders,
  addAttributeValuetoAttributes,
  editAdminUserHeaders,
  rateAssetHeaders,
  deletePlayListHeaders,
  createTestHeaders,
  getCourseQandAHeaders,
  addUserProfileHeaders,
  createLinkedContentPayloadHeaders,
  publishlinkedContentHeaders,
  userGoalsHeader,
  contentLaunchEventHeaders,
  achievementsDataHeaders,
  searchContentHeaders,
  createLiveCourseHeaders,
  createLocationHeaders,
  createClassroomHeaders,
  getLocationsForIltHeaders,
  getClassRoomsForIltHeaders,
  createLiveClassHeaders,
  publishLiveCourseHeaders,
  editAssignmentHeaders,
  saveQuestionHeader,
  getContainerViewHeader,
  createDynamicContentHeader,
  saveContainerHeader,
  publishDynamicContentHeaders,
  publishContainerHeaders,
  addContentToDCHeaders,
  addAudienceToDynamicContentHeaders,
  fetchContentUUIDHeaders,
  createContentConfigHeaders,
  completionCriteriaDefaultsHeaders,
  getOrgRiskAreasHeaders,
  updateRiskAreaSequenceHeaders,
  getContentConfigExternalIdHeaders,
  getContentConfigTopicsHeaders,
  publishContentConfigHeaders,
  draftContentConfigHeaders,
  getAllContentItemsHeaders,
  createLearningProgramHeaders,
  getLearningProgramBusineesObjectiveHeaders,
  createLearningProgramBusineesObjectiveHeaders,
  getAllLearingProgramHeaders,
  deleteLearningProgramHeader,
  getAudienceUsersHeaders,
  archiveLearningProgramHeader,
  createCertificationPathHeaders,
  getCertificationSubjectsHeaders,
  patchSubjectstoCertificationPath,
  retireCertificationPathHeaders,
  getPrimaryJobRolesHeaders,
  getAspirationJobRolesHeaders,
  setPrimaryJobRoleHeaders,
  setAspirationJobRoleHeaders,
  userFocusSkillsHeaders,
  rateSkillHeaders,
  createStudyGroupHeaders,
  getStudyGroupShareLinkHeaders,
  featureTrackingEventForPlaylistHeaders,
  generateJwtTokenHeaders,
  aiCoachLearnerHeaders,
  aiCoachChatStreamHeaders,
  aiAssistantHeaders,
  lxStudioGraphqlHeaders,
  caisyPresentationsGraphqlHeaders,
  createProjectInWorkspaceHeaders,
  aiSimulatorGraphqlHeaders,
  aiContentGenGetAvailableTemplatesHeaders,
  aiContentGenStreamChatHeaders,
  aiContentGenContentMetadataHeaders,
  lxAssessmentCreateHeaders,
  lxAssessmentSaveLearningObjectiveHeaders,
  lxAssessmentGenerateDescriptionHeaders,
  lxAssessmentAsyncQuestionGenerationHeaders,
  lxAssessmentAsyncQuestionGenerationStatusHeaders,
  lxAssessmentSaveRecommendationsHeaders,
  lxAssessmentSearchContentHeaders,
  lxAssessmentSkillsHeaders,
  saveCustomLandingPageHeaders,
  fetchAllCustomLandingPagesHeaders,
  deleteCustomLandingPageHeaders,
};
