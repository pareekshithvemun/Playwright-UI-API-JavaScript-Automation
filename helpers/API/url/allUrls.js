import config from "config";
import { USAUrls } from "../../../testData/contentConfig/USAurls.js";
let baseURL, attributeNAME, Org_ID;
let pubBaseURL = "https://use1-stage-cp.stage.percipio.com";
Org_ID = config.get("Environment").orgId;
baseURL = config.get("Environment").baseURL;
let contentConfigBaseUrl = USAUrls.includes(baseURL)
  ? "https://use1-prod-compliance-content-config-tool.percipio.com/api"
  : "https://euc1-prod-compliance-content-config-tool.percipio.com/api";
let contentPlayerSettingsBaseUrl = USAUrls.includes(baseURL)
  ? "https://use1-prod-content-player-settings-front.percipio.com/api"
  : "https://euc1-prod-content-player-settings-front.percipio.com/api";

attributeNAME = config.get("Environment").attributeName; //attribute Name

const createUserUrl = `${baseURL}/api/ucm/users/new`;
const urlOfCreateAttribute = `${baseURL}/api/ucm/custom-attributes`;
const devtokenGeneratorapiUrl = `${baseURL}/api/public/auth/authenticate`;
const audienceCreationUrl = `${baseURL}/api/ucm/audiences`;
const getAllLicencePoolsUrl = `${baseURL}/api/admin/licenses/license-pool-sets`;
const getLicensePoolSetRulesUrl = `${baseURL}/api/admin/licenses/license-pool-set-rules`;
const addlicencePoolUrl = `${baseURL}/api/admin/licenses/license-pool-set-rules/create-license`;
const createChildSiteUrl = `${baseURL}/api/ucm/multi-sites/create-childsite`;
const getMultiSitesHierarchyUrl = `${baseURL}/api/ucm/multi-sites`;
const getOrganizationDetailsUrl = `${baseURL}/api/ucm/multi-sites/organizations`;
const postassignmentcallUrl = `${baseURL}/api/ucm/assignments/create`;
const getChannelsorJourneysInOrgUrl = `${baseURL}/api/ucm/channels/fetch-paginated`;
const getAreasOfOrgUrl = `${baseURL}/api/ucm/areas?localeCode=en-US`;
const getFetchLibrariesUrl = `${baseURL}/api/graphql3?query=fetchLibraries`;
const createStripUrl = `${baseURL}/api/ucm/promoted-content/strips`;
const createPlayListUrl = `${baseURL}/api/graphql3?query=mutation:createPlaylist`;
const addContentToPlaylisturl = `${baseURL}/api/graphql3?query=mutation:addOrDeleteItemFromPlaylists`;
const getAllPlayListUrl = `${baseURL}/api/graphql3?query=userPlaylistsWithLimitedItems-sharedPlaylistsWithLimitedItems`;
const playlistWithItemsUrl = `${baseURL}/api/graphql3?query=playlistWithItems`;
const getAllBannersUrl = `${baseURL}/api/ucm/promoted-content/fetch-banners`;
const getAllStripsUrl = `${baseURL}/api/ucm/promoted-content/fetch-strips`;
const baseUrlOfpostDataTopSearchedTerms = `${baseURL}/api/graphql3?query=search`;
const baseUrlOfgetAllAudience = `${baseURL}/api/ucm/audiences/audience-list-page`;
const getBusinessObjectiveUrl = `${baseURL}/api/ucm/assignments/v2/business-objectives`;
const getAllInterestsOfUserUrl = `${baseURL}/api/graphql3?query=gatewayInterests-areaQuery`;
const saveInterestOfUserUrl = `${baseURL}/api/graphql3?query=mutation:saveInterests`;
const getAllAssignments = `${baseURL}/api/ucm/assignments/get-all-assignments/v2`;
const getUsersUrl = `${baseURL}/api/ucm/users`;
const getcontentUUIDsUrl = `${baseURL}/api/graphql3?query=dwAllContentListingRows`;
const contentCompletionUrl = `${baseURL}/api/ucm/completions-and-waivers/grant-completion`;
const createAssessment = `${baseURL}/api/graphql3?query=mutation:createAssessmentAssetChallenge`;
const ChallengeSubmissionUrl = `${baseURL}/api/graphql3?query=mutation:createChallengeSubmission`;
const getSubmissionUrl = `${baseURL}/api/graphql3?query=getSubmission-knowledgeCheckConsumption-mutation:reportAssessment`;
const contentConsumptionBaseUrl = `${baseURL}/api/graphql2?query=mutation:contentConsumption`;
const customContentConsumptionBaseUrl = `${baseURL}/api/graphql2?query=mutation:contentLaunchEvent-mutation:contentConsumption`;
const activityDashBoardUrl = `${baseURL}/api/graphql3?query=getActivityDashboard`;
const getVideoIdFromCourseIdUrl = `${baseURL}/api/graphql2?query=courseQueryWithBadging-userAssignmentsForAsset`;
const getAllAttributesUrl = `${baseURL}/api/ucm/custom-attributes/count`;
const orgSettingsUrl = `${baseURL}/api/ucm/settings/org-settings`;
const createTest = `${baseURL}/api/graphql3?query=mutation:createChallenge`;
const editUserImageUrl = `${baseURL}/api/graphql2?query=mutation:updateProfileImage`;
const rateTheAssetUrl = `${baseURL}/api/graphql3?query=mutation:upsertAssetRating`;
const deletePlayListUrl = `${baseURL}/api/graphql3?query=mutation:deletePlaylist`;
const userGoalsUrl = `${baseURL}/api/graphql2?query=mutation:userGoalsAndStreaksNewGoal`;
const contentLaunchEventUrl = `${baseURL}/api/graphql2?query=mutation:contentLaunchEvent`;
const achivementsDataUrl = `${baseURL}/api/graphql3?query=dwExecDashboardAdoptionByOrg-dwExecDashboardDiscoveryByOrg-dwExecDashboardLearningByOrg-dwExecDashboardAchievementByOrg`;
const searchContentUrl = `${baseURL}/api/graphql3?query=search`;
const createLiveCourseUrl = `${baseURL}/api/ucm/live-course/create-course`;
const createLocationUrl = `${baseURL}/api/ucm/live-course/create-location`;
const createClassroomUrl = `${baseURL}/api/ucm/live-course/create-classroom`;
const getAllLocationsForIltUrl = `${baseURL}/api/ucm/live-course/fetch-all-locations`;
const getAllClassRoomsForIltUrl = `${baseURL}/api/ucm/live-course/fetch-all-classrooms`;
const createLiveClassUrl = `${baseURL}/api/ucm/live-course/create-liveclass`;
const courseConsumptionUrl = `${baseURL}/api/graphql2?query=mutation:contentLaunchEvent-mutation:contentLaunchEvent`;
const saveQuestionUrl = `${baseURL}/api/ucm/dynamic-content/save-question`;
const getContainerView = `${baseURL}/api/ucm/dynamic-content/get-container-admin-view-hierarchy-and-content`;
const saveContainerUrl = `${baseURL}/api/ucm/dynamic-content/save-tc-container`;
const publishContainerUrl = `${baseURL}/api/ucm/dynamic-content/publish-container`;
const addContentToDynamicConUrl = `${baseURL}/api/ucm/dynamic-content/save-container-content-maps`;
const createContentConfigUrl = `${contentConfigBaseUrl}/course/create/virtual`;
const draftContentConfigUrl = `${contentConfigBaseUrl}/customization/draft`;
const getAllContentItemsUrl = `${baseURL}/api/ucm/linked-content/content/summaries?isCaisyVisible=false`;
const createLearningProgramUrl = `${baseURL}/api/ucm/learning-programs/create`;
const getLearningProgramBusineesObjectiveUrl = `${baseURL}/api/ucm/learning-programs/v1/business-objectives`;
const createLearningProgramBusineesObjectiveUrl = `${baseURL}/api/ucm/learning-programs/custom-business-objectives-create`;
const getAllLearningProgramsUrl = `${baseURL}/api/ucm/learning-programs/v1/learning-program-list`;
const getPrimaryJobRolesUrl = `${baseURL}/api/graphql3?query=primaryJobRolesFromDB`;
const searchCustomJobRolesUrl = `${baseURL}/api/graphql3?query=primaryJobRolesFromDBKg`;
const roleSkillsKgUrl = `${baseURL}/api/graphql3?query=roleInfoWithSkillsKg`;
const saveFocusSkillsKgUrl = `${baseURL}/api/graphql3?query=mutation:saveAllKGFocusSkills`;
const rateFocusSkillKgUrl = `${baseURL}/api/graphql3?query=mutation:updateUserKGSkillRatings`;
const curatorGraphqlUrl = `${baseURL}/talent-intelligence/api/graphql/curator`;
const knowledgeGraphGraphqlUrl = `${baseURL}/talent-intelligence/knowledge-graph/api/graphql`;
const getAspirationJobRolesUrl = `${baseURL}/api/graphql3?query=suggestedAspirationalJobroles`;
const setPrimaryJobRoleUrl = `${baseURL}/api/graphql3?query=mutation:saveUserRoles`;
const setAspirationJobRoleUrl = `${baseURL}/api/graphql3?query=mutation:saveUserJobRoleV2`;
const userFocusSkillsUrl = `${baseURL}/api/graphql3?query=userFocusSkills`;
const rateSkillUrl = `${baseURL}/api/graphql3?query=mutation:updateUserSkillRatings`;
const createStudyGroupUrl = `${baseURL}/api/graphql3?query=mutation:createGroupChallenge`;
const getStudyGroupShareLink = `${baseURL}/api/graphql2?query=shareLinkByUrl`;
const featureTrackingEventUrl = `${baseURL}/api/graphql2?query=mutation:featureTrackingEvent`;
const generateJwtTokenUrl = `${baseURL}/ai-assistant/create-tokens`;
const aiAssistantUrl = `${baseURL}/ai-assistant/api/assistant-events`;
const lxStudioGraphQLUrl = `${baseURL}/lx-studio/api/lx-studio-service/graphql`;
const caisyPresentationsGraphqlUrl = `${baseURL}/caisy-presentations/api/graphql`;
const aiSimulatorGraphqlUrl = `${baseURL}/ai-simulator/api/graphql`;
const s3BucketUrl = `https://ssoft-use1-prod-aud-conv-practice-media-store.s3.us-east-1.amazonaws.com`;

// AI Content Gen URLs
const aiContentGenGetAvailableTemplatesUrl = `${baseURL}/ai-content-gen/api/getAvailableTemplates`;
const aiContentGenStreamChatUrl = `${baseURL}/ai-content-gen/api/stream/chat`;
function getAiContentGenContentMetadataUrl(contentId, lang = "en-US") {
  return `${baseURL}/ai-content-gen/api/content-metadata/${contentId}?lang=${lang}`;
}
function getAiContentGenPublishUrl(contentId) {
  return `${baseURL}/ai-content-gen/api/publish/${contentId}`;
}

// LX Studio Assessment URLs
const lxAssessmentCreateUrl = `${baseURL}/lx-assessments/quiz-service/api/v2/assessment-generation/graphql/`;
const lxAssessmentSaveLearningObjectiveUrl = `${baseURL}/lx-assessments/quiz-service/api/assessment-generation/save-learning-objective/`;
const lxAssessmentGenerateDescriptionUrl = `${baseURL}/lx-assessments/quiz-service/api/assessment-generation/generate-description/`;
const lxAssessmentAsyncQuestionGenerationUrl = `${baseURL}/lx-assessments/quiz-service/api/assessment-generation/async-question-generation-ks/`;
const lxAssessmentAsyncQuestionGenerationStatusUrl = (jobId) =>
  `${baseURL}/lx-assessments/quiz-service/api/v2/assessment-generation/async-question-generation-ks-status/${jobId}/`;
const lxAssessmentSaveRecommendationsUrl = `${baseURL}/lx-assessments/quiz-service/api/assessment-generation/save-recommendations/`;
const lxAssessmentSkillsUrl = `${baseURL}/lx-assessments/api/skills`;
const lxAssessmentSearchContentUrl = `${baseURL}/lx-assessments/search-service/api/graphql`;
const lxAssessmentGetQuestionsUrl = (assessmentContainerId, assessmentId) =>
  `${baseURL}/lx-assessments/quiz-service/api/assessment-generation/get-assessment-questions/?assessment_container_id=${assessmentContainerId}&assessment_id=${assessmentId}`;
const lxAssessmentQuestionBankUuidMappingUrl = `${baseURL}/lx-assessments/quiz-service/api/assessment-generation/question-bank-uuid-mapping/`;
const saveCustomLandingPageUrl = `${baseURL}/api/ucm/custom-landing-page/templates/save`;
const fetchAllCustomLandingPagesUrl = `${baseURL}/api/ucm/custom-landing-page/templates/fetch-all?pageType=LANDING_PAGES`;
const fetchAllSitesUrl = `${baseURL}/api/ucm/content-management/fetch-all-sites`;
const searchSkillsUrl = `${baseURL}/api/ucm/skilz/search`;
const fetchLinkedContentSummariesUrl = `${baseURL}/api/ucm/linked-content/content/summaries/paginated`;

function getValuesOfListAttriHeadersUrl(attributeUUid) {
  return `${baseURL}/api/ucm/custom-attributes/values/${attributeUUid}`;
}

function editListAttribute(attributeUUid) {
  return `${baseURL}/api/ucm/custom-attributes/${attributeUUid}`;
}

function customAreaUrl(uuid) {
  return `${baseURL}/api/ucm/areas/${uuid}`;
}

function customSubJectUrl(uuid) {
  return `${baseURL}/api/ucm/subjects/${uuid}`;
}

function customChannelCreationUrl(uuid) {
  return `${baseURL}/api/ucm/channels/${uuid}`;
}

function getChannelInfoUrl(channelID) {
  return `${baseURL}/api/ucm/channels/${channelID}`;
}

function addcontentToChannelUrl(channelviewID) {
  return `${baseURL}/api/ucm/channel-views/${channelviewID}/content-items`;
}

function publishChannelorJourneyUrl(channelID) {
  return `${baseURL}/api/ucm/channels/${channelID}/publish`;
}

function createJourneyUrl(uuid) {
  return `${baseURL}/api/ucm/v2/channels/${uuid}`;
}

function addIntroToJourneyUrl(uuid) {
  return `${baseURL}/api/ucm/v2/channel-views/${uuid}`;
}

function addTrackorRelatedContentToJourneyUrl(uuid) {
  return `${baseURL}/api/ucm/v2/channel-views/${uuid}`;
}

function addAudienceToJourneyUrl(journeyID) {
  return `${baseURL}/api/ucm/channels/${journeyID}/audiences`;
}

function getJourneyInfoUrl(journeyID) {
  return `${baseURL}/api/ucm/v2/channels/${journeyID}?locale=en-US`;
}

function deleteTrackUrl(trackId) {
  return `${baseURL}/api/ucm/channel-views/${trackId}`;
}

function retirechannelUrl(channelID) {
  return `${baseURL}/api/ucm/channels/${channelID}/retire`;
}

function deletechannelUrl(channelID) {
  return `${baseURL}/api/ucm/channels/${channelID}`;
}

function deleteAreaUrl(areaID) {
  return `${baseURL}/api/ucm/areas/${areaID}`;
}

function deleteStripUrl(stripId) {
  return `${baseURL}/api/ucm/promoted-content/strips/${stripId}`;
}

function deleteBannerUrl(bannerId) {
  return `${baseURL}/api/ucm/promoted-content/banners/${bannerId}`;
}

function cancelAsignmentUrl(assignmentId) {
  return `${baseURL}/api/ucm/assignments/cancel/${assignmentId}/canceled?notify=false&scopedUserUuid=null`;
}

function deleteAssignmentUrl(assignmentId) {
  return `${baseURL}/api/ucm/assignments/${assignmentId}`;
}
function getCourseuuidListUrl(courseId) {
  return `${pubBaseURL}/api/page/video/${courseId}/files`;
}
function extractQAapiUrl(uuid) {
  return `${pubBaseURL}/api/page/video/${uuid}/questions/test`;
}
function getBMQuestionBankUrl(benchMrkId) {
  return `${pubBaseURL}/api/page/assessment/${benchMrkId}/question-banks`;
}
function getBMQuestionsUrl(questionBankUuid) {
  return `${pubBaseURL}/api/page/question-bank/${questionBankUuid}/questions`;
}

function getSingleAssignmentInfoUrl(assignmentUUID) {
  return `${baseURL}/api/ucm/assignments/${assignmentUUID}?locale=en-US`;
}
function ediAdminUserUrl(userId) {
  return `${baseURL}/api/ucm/users/${userId}`;
}
function getCourseQandAUrl(courseId) {
  return `${pubBaseURL}/api/page/course/${courseId}/assessment`;
}

function getlinkedContentUrl(uuid) {
  return `${baseURL}/api/ucm/linked-content/${uuid}`;
}

function publishlinkedContentUrl(uuid) {
  return `${baseURL}/api/ucm/linked-content/${uuid}/publish`;
}

function publishLiveCourseUrl(liveCourseUuid) {
  return `${baseURL}/api/ucm/live-course/publish-course/${liveCourseUuid}`;
}

function updateAssignmentUrl(assignmentId) {
  return `${baseURL}/api/ucm/assignments/update/${assignmentId}`;
}

function createDynamicContentUrl(assetId) {
  return `${baseURL}/api/ucm/v2/channels/${assetId}`;
}

function publishDynamicContentUrl(assetId) {
  return `${baseURL}/api/ucm/channels/${assetId}/publish`;
}

function addAudienceToDynamicContentUrl(dynamicContentId) {
  return `${baseURL}/api/ucm/channels/${dynamicContentId}/audiences`;
}

function fetchContentUUIDUrl(contentNameInUrlEncodedFormat) {
  return `${baseURL}/api/ucm/search?offset=0&max=10&query=${contentNameInUrlEncodedFormat}&locale=en-US&typeFilters=Channel&sourceFilter=&contentSets=&includeContentNotInChannel=true&includeReplacementsForRetiring=true`;
}

function getContentConfigExternalIdUrl(contentConfigId) {
  return `${contentConfigBaseUrl}/course/${contentConfigId}`;
}

function getContentConfigTopicsUrl(externalId) {
  return `${contentConfigBaseUrl}/course/metadata/${externalId}`;
}

function publishContentConfigUrl(contentConfigUUID) {
  return `${contentConfigBaseUrl}/customization/publish/${contentConfigUUID}`;
}

function delLearningProgramUrl(learningProgramurl) {
  return `${baseURL}/api/ucm/learning-programs/${learningProgramurl}/delete`;
}

function archiveLearningProgramUrl(learningProgramurl) {
  return `${baseURL}/api/ucm/learning-programs/${learningProgramurl}/archive`;
}

function getAudienceUsersUrl(audienceId) {
  return `${baseURL}/api/ucm/users/${audienceId}/audience-users`;
}

function getCertificationSubjectsUrl(channelUuid) {
  return `${baseURL}/api/ucm/subjects/v2/subject-pairs?channelUuid=${channelUuid}&types=STANDARD,CERTIFICATION`;
}
function patchSubjectstoCertificationPathUrl(channelUuid) {
  return `${baseURL}/api/ucm/v2/channels/${channelUuid}?locale=en-US`;
}
function patchJourneyUrl(journeyUuid) {
  return `${baseURL}/api/ucm/v2/channels/${journeyUuid}?locale=en-US`;
}
function retireCertificationPathUrl(channelUuid) {
  return `${baseURL}/api/ucm/channels/${channelUuid}/retire`;
}

function deleteCustomLandingPageUrl(parentPageUuid) {
  return `${baseURL}/api/ucm/custom-landing-page/pages/delete/${parentPageUuid}/draft/custom?pageType=LANDING_PAGES`;
}

function shareContentToSitesUrl(contentItemUuid) {
  return `${baseURL}/api/ucm/content-management/${contentItemUuid}/share`;
}

function getRolePrivilegesUrl() {
  return `${baseURL}/api/ucm/role-privileges/${Org_ID}/roles`;
}

function usersDownloadStatusUrl(jobId) {
  return `${baseURL}/api/ucm/users/downloads/${jobId}/status`;
}

const usersDownloadAllUsersUrl = `${baseURL}/api/ucm/users/downloads/all?disableUsernameForSSO=false`;
const nativeCompletionSettingLinkUrl = `${baseURL}/api/nativeCompletionSettingLink`;
const contentPlayerSettingsAuthBearerUrl = `${contentPlayerSettingsBaseUrl}/client/auth/bearer`;
const completionCriteriaBasicDefaultsUrl = `${contentPlayerSettingsBaseUrl}/completioncriteria/organization/defaults/basic`;
const completionCriteriaAdvancedDefaultsUrl = `${contentPlayerSettingsBaseUrl}/completioncriteria/organization/defaults/advanced`;
const getOrgRiskAreasUrl = `${baseURL}/api/graphql3?query=getOrgRiskAreas`;
const updateRiskAreaSequenceUrl = `${baseURL}/api/graphql3?query=mutation:UpdateRiskAreaSequence`;
const aiCoachJobRolesUrl = `${baseURL}/ai-coach/api/user/v1/percipio-job-roles`;
const aiCoachClientProfileUrl = `${baseURL}/ai-coach/api/user/v1/client-profile`;
const aiCoachSelfAssessmentUrl = `${baseURL}/ai-coach/api/user/v1/self-assessment`;
const aiCoachDataUrl = `${baseURL}/ai-coach/api/user/v1/data`;
const aiCoachInsightsCompleteUrl = `${baseURL}/ai-coach/api/user/v1/insights-tasks/complete`;
const aiCoachRoleBasedSkillsUrl = `${baseURL}/ai-coach/api/goals/percipio-role-based-skills`;
const aiCoachGoalsUrl = `${baseURL}/ai-coach/api/goals`;
const aiCoachCoachingSessionsUrl = `${baseURL}/ai-coach/api/v1/coaching-sessions`;
const aiCoachChatStreamUrl = `${baseURL}/ai-coach/api/v1/chat/stream`;
const aiCoachLaunchesUrl = `${baseURL}/ai-coach/api/v1/launches`;

function aiCoachGoalTasksUrl(goalId) {
  return `${baseURL}/ai-coach/api/goals/${goalId}/tasks`;
}

function aiCoachTaskStatusUrl(taskId) {
  return `${baseURL}/ai-coach/api/goals/task-status-update/${taskId}`;
}

function aiCoachGoalStatusUrl(goalId) {
  return `${baseURL}/ai-coach/api/goals/status-update/${goalId}`;
}

function aiCoachLaunchSessionNotesUrl(launchId) {
  return `${baseURL}/ai-coach/api/v1/launches/${launchId}/session-notes`;
}

function aiCoachLaunchCheckpointUrl(launchId) {
  return `${baseURL}/ai-coach/api/v1/launches/${launchId}/checkpoint`;
}

function aiCoachLaunchEngagementBlocksUrl(launchId) {
  return `${baseURL}/ai-coach/api/v1/launches/${launchId}/engagement-blocks`;
}

export let urlData = {
  attributeNAME,
  createUserUrl,
  Org_ID,
  urlOfCreateAttribute,
  devtokenGeneratorapiUrl,
  audienceCreationUrl,
  getAllLicencePoolsUrl,
  getLicensePoolSetRulesUrl,
  addlicencePoolUrl,
  createChildSiteUrl,
  getMultiSitesHierarchyUrl,
  getOrganizationDetailsUrl,
  postassignmentcallUrl,
  getChannelsorJourneysInOrgUrl,
  getAreasOfOrgUrl,
  getFetchLibrariesUrl,
  createStripUrl,
  createPlayListUrl,
  addContentToPlaylisturl,
  getAllPlayListUrl,
  playlistWithItemsUrl,
  getAllStripsUrl,
  getAllBannersUrl,
  baseUrlOfpostDataTopSearchedTerms,
  baseUrlOfgetAllAudience,
  getBusinessObjectiveUrl,
  getAllInterestsOfUserUrl,
  getAllAssignments,
  getUsersUrl,
  getcontentUUIDsUrl,
  saveInterestOfUserUrl,
  contentCompletionUrl,
  createAssessment,
  contentConsumptionBaseUrl,
  customContentConsumptionBaseUrl,
  activityDashBoardUrl,
  getVideoIdFromCourseIdUrl,
  getAllAttributesUrl,
  ChallengeSubmissionUrl,
  getSubmissionUrl,
  orgSettingsUrl,
  editUserImageUrl,
  rateTheAssetUrl,
  searchContentUrl,
  getAllLocationsForIltUrl,
  getAllClassRoomsForIltUrl,
  publishContainerUrl,
  createTest,
  courseConsumptionUrl,
  userGoalsUrl,
  deletePlayListUrl,
  contentLaunchEventUrl,
  achivementsDataUrl,
  createLiveCourseUrl,
  createLocationUrl,
  createClassroomUrl,
  createLiveClassUrl,
  saveQuestionUrl,
  getContainerView,
  saveContainerUrl,
  addContentToDynamicConUrl,
  saveContainerUrl,
  createContentConfigUrl,
  draftContentConfigUrl,
  getAllContentItemsUrl,
  createLearningProgramUrl,
  getLearningProgramBusineesObjectiveUrl,
  createLearningProgramBusineesObjectiveUrl,
  getAllLearningProgramsUrl,
  getPrimaryJobRolesUrl,
  searchCustomJobRolesUrl,
  roleSkillsKgUrl,
  saveFocusSkillsKgUrl,
  rateFocusSkillKgUrl,
  curatorGraphqlUrl,
  knowledgeGraphGraphqlUrl,
  getAspirationJobRolesUrl,
  setPrimaryJobRoleUrl,
  setAspirationJobRoleUrl,
  userFocusSkillsUrl,
  rateSkillUrl,
  featureTrackingEventUrl,
  createStudyGroupUrl,
  getStudyGroupShareLink,
  aiAssistantUrl,
  createStudyGroupUrl,
  generateJwtTokenUrl,
  lxStudioGraphQLUrl,
  caisyPresentationsGraphqlUrl,
  aiSimulatorGraphqlUrl,
  s3BucketUrl,
  aiContentGenGetAvailableTemplatesUrl,
  aiContentGenStreamChatUrl,
  getAiContentGenContentMetadataUrl,
  getAiContentGenPublishUrl,
  lxAssessmentCreateUrl,
  lxAssessmentSaveLearningObjectiveUrl,
  lxAssessmentGenerateDescriptionUrl,
  lxAssessmentAsyncQuestionGenerationUrl,
  lxAssessmentAsyncQuestionGenerationStatusUrl,
  lxAssessmentSaveRecommendationsUrl,
  lxAssessmentSkillsUrl,
  lxAssessmentSearchContentUrl,
  lxAssessmentGetQuestionsUrl,
  lxAssessmentQuestionBankUuidMappingUrl,
  saveCustomLandingPageUrl,
  fetchAllCustomLandingPagesUrl,
  fetchAllSitesUrl,
  searchSkillsUrl,
  fetchLinkedContentSummariesUrl,
  delLearningProgramUrl,
  archiveLearningProgramUrl,
  deleteAssignmentUrl,
  customAreaUrl,
  customSubJectUrl,
  customChannelCreationUrl,
  getChannelInfoUrl,
  addcontentToChannelUrl,
  publishChannelorJourneyUrl,
  createJourneyUrl,
  addIntroToJourneyUrl,
  addTrackorRelatedContentToJourneyUrl,
  addAudienceToJourneyUrl,
  getSingleAssignmentInfoUrl,
  getJourneyInfoUrl,
  deleteTrackUrl,
  retirechannelUrl,
  deletechannelUrl,
  deleteAreaUrl,
  deleteBannerUrl,
  deleteStripUrl,
  cancelAsignmentUrl,
  getCourseuuidListUrl,
  extractQAapiUrl,
  getBMQuestionBankUrl,
  getBMQuestionsUrl,
  getValuesOfListAttriHeadersUrl,
  editListAttribute,
  ediAdminUserUrl,
  getCourseQandAUrl,
  ediAdminUserUrl,
  getlinkedContentUrl,
  publishlinkedContentUrl,
  publishLiveCourseUrl,
  updateAssignmentUrl,
  createDynamicContentUrl,
  publishDynamicContentUrl,
  addAudienceToDynamicContentUrl,
  fetchContentUUIDUrl,
  getContentConfigExternalIdUrl,
  getContentConfigTopicsUrl,
  publishContentConfigUrl,
  getAudienceUsersUrl,
  getCertificationSubjectsUrl,
  patchSubjectstoCertificationPathUrl,
  patchJourneyUrl,
  retireCertificationPathUrl,
  deleteCustomLandingPageUrl,
  shareContentToSitesUrl,
  getRolePrivilegesUrl,
  usersDownloadAllUsersUrl,
  usersDownloadStatusUrl,
  nativeCompletionSettingLinkUrl,
  contentPlayerSettingsAuthBearerUrl,
  completionCriteriaBasicDefaultsUrl,
  completionCriteriaAdvancedDefaultsUrl,
  getOrgRiskAreasUrl,
  updateRiskAreaSequenceUrl,
  aiCoachJobRolesUrl,
  aiCoachClientProfileUrl,
  aiCoachSelfAssessmentUrl,
  aiCoachDataUrl,
  aiCoachInsightsCompleteUrl,
  aiCoachRoleBasedSkillsUrl,
  aiCoachGoalsUrl,
  aiCoachCoachingSessionsUrl,
  aiCoachChatStreamUrl,
  aiCoachLaunchesUrl,
  aiCoachGoalTasksUrl,
  aiCoachTaskStatusUrl,
  aiCoachGoalStatusUrl,
  aiCoachLaunchSessionNotesUrl,
  aiCoachLaunchCheckpointUrl,
  aiCoachLaunchEngagementBlocksUrl,
};
