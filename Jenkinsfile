Jenkins
@Library(['skillsoft-ci-pipeline']) _
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

properties([
    buildDiscarder(logRotator(artifactDaysToKeepStr: '7', artifactNumToKeepStr: '', daysToKeepStr: '7', numToKeepStr: '')),
    // One TimerTrigger only — multiple cron() entries overwrite; use a multi-line spec.
    // Bimonthly (even months): days 01-04 hours 00-12 UTC; day 05 hour 00 only (platformtest "05".timeOne).
    // Monthly external users: 30 2 6 * * → 8:00 AM IST on the 6th (see isMonthlyExternalUsersCron).
    pipelineTriggers([
        cron('''
            00 0-12 01-04 2,4,6,8,10,12 *
            00 0 05 2,4,6,8,10,12 *
            30 2 6 * *
        ''')
    ]),
    parameters([
        choice(
            choices: [
                '',
                "https://akara.percipio.com",
                "https://contenteval.percipio.com",
                "https://learnvantagedemo.percipio.com",
                "https://percipiocore.percipio.com",
                "https://percipiodemo.percipio.com",
                "https://platformeval.percipio.com",
                "https://platformeval01.percipio.com",
                "https://platformeval02.percipio.com",
                "https://platformeval03.percipio.com",
                "https://platformeval04.percipio.com",
                "https://platformeval05.percipio.com",
                "https://platformeval06.percipio.com",
                "https://platformeval07.percipio.com",
                "https://platformeval08.percipio.com",
                "https://platformeval09.percipio.com",
                "https://platformeval010.percipio.com",
                "https://platformeval011.percipio.com",
                "https://platformeval12.percipio.com",
                "https://platformeval13.percipio.com",
                "https://platformeval14.percipio.com",
                "https://platformeval15.percipio.com",
                "https://platformeval16.percipio.com",
                "https://platformeval17.percipio.com",
                "https://platformeval18.percipio.com",
                "https://platformeval19.percipio.com",
                "https://platformeval20.percipio.com",
                "https://platformeval21.percipio.com",
                "https://platformeval22.percipio.com",
                "https://platformeval23.percipio.com",
                "https://platformeval24.percipio.com",
                "https://platformeval25.percipio.com",
                "https://platformeval26.percipio.com",
                "https://platformeval27.percipio.com",
                "https://platformeval28.percipio.com",
                "https://platformeval29.percipio.com",
                "https://platformeval30.percipio.com",
                "https://platformeval31.percipio.com",
                "https://platformeval32.percipio.com",
                "https://platformeval33.percipio.com",
                "https://platformeval34.percipio.com",
                "https://platformeval35.percipio.com",
                "https://platformeval36.percipio.com",
                "https://platformeval37.percipio.com",
                "https://platformeval38.percipio.com",
                "https://platformeval39.percipio.com",
                "https://platformeval40.percipio.com",
                "https://platformeval41.percipio.com",
                "https://platformeval42.percipio.com",
                "https://platformeval43.percipio.com",
                "https://platformeval44.percipio.com",
                "https://platformeval45.percipio.com",
                "https://platformeval46.percipio.com",
                "https://platformeval47.percipio.com",
                "https://platformeval48.percipio.com",
                "https://platformeval49.percipio.com",
                "https://platformeval50.percipio.com",
                "https://platformeval51.percipio.com",
                "https://platformeval52.percipio.com",
                "https://platformeval53.percipio.com",
                "https://platformeval54.percipio.com",
                "https://platformeval55.percipio.com",
                "https://platformeval56.percipio.com",
                "https://platformeval57.percipio.com",
                "https://platformeval58.percipio.com",
                "https://platformeval59.percipio.com",
                "https://platformeval60.percipio.com",
                "https://platformeval61.percipio.com",
                "https://platformeval62.percipio.com",
                "https://platformeval63.percipio.com",
                "https://platformeval64.percipio.com",
                "https://platformeval65.percipio.com",
                "https://platformeval66.percipio.com",
                "https://platformeval67.percipio.com",
                "https://platformeval68.percipio.com",
                "https://platformeval69.percipio.com",
                "https://platformeval70.percipio.com",
                "https://platformeval71.percipio.com",
                "https://platformeval72.percipio.com",
                "https://platformeval73.percipio.com",
                "https://platformeval74.percipio.com",
                "https://platformeval75.percipio.com",
                "https://platformeval76.percipio.com",
                "https://platformeval77.percipio.com",
                "https://platformeval78.percipio.com",
                "https://platformeval79.percipio.com",
                "https://platformeval80.percipio.com",
                "https://platformeval81.percipio.com",
                "https://platformeval82.percipio.com",
                "https://platformeval83.percipio.com",
                "https://platformeval84.percipio.com",
                "https://platformeval85.percipio.com",
                "https://platformeval86.percipio.com",
                "https://platformeval87.percipio.com",
                "https://platformeval88.percipio.com",
                "https://platformeval89.percipio.com",
                "https://platformeval90.percipio.com",
                "https://platformeval91.percipio.com",
                "https://platformeval92.percipio.com",
                "https://platformeval93.percipio.com",
                "https://platformeval94.percipio.com",
                "https://platformeval95.percipio.com",
                "https://platformeval96.percipio.com",
                "https://platformeval97.percipio.com",
                "https://platformeval98.percipio.com",
                "https://platformeval99.percipio.com",
                "https://platformeval100.percipio.com",
                "https://platformtest.percipio.com",
                "https://presales1.percipio.com",
                "https://presales1a.percipio.com",
                "https://presales1b.percipio.com",
                "https://presales2.percipio.com",
                "https://presales2a.percipio.com",
                "https://presales2b.percipio.com",
                "https://presales3.percipio.com",
                "https://presales3a.percipio.com",
                "https://presales3b.percipio.com",
                "https://presales4.percipio.com",
                "https://presales4a.percipio.com",
                "https://presales4b.percipio.com",
                "https://presales5.percipio.com",
                "https://presales5a.percipio.com",
                "https://presales5b.percipio.com",
                "https://presales6.percipio.com",
                "https://presales6a.percipio.com",
                "https://presales6b.percipio.com",
                "https://presales7.percipio.com",
                "https://presales7a.percipio.com",
                "https://presales7b.percipio.com",
                "https://presales8.percipio.com",
                "https://presales8a.percipio.com",
                "https://presales8b.percipio.com",
                "https://presales9.percipio.com",
                "https://presales9a.percipio.com",
                "https://presales9b.percipio.com",
                "https://presales10.percipio.com",
                "https://presales10a.percipio.com",
                "https://presales10b.percipio.com",
                "https://presales11.percipio.com",
                "https://presales11a.percipio.com",
                "https://presales11b.percipio.com",
                "https://presales12.percipio.com",
                "https://presales12a.percipio.com",
                "https://presales12b.percipio.com",
                "https://presales13.percipio.com",
                "https://presales13a.percipio.com",
                "https://presales13b.percipio.com",
                "https://presales14.percipio.com",
                "https://presales14a.percipio.com",
                "https://presales14b.percipio.com",
                "https://presales15.percipio.com",
                "https://presales15a.percipio.com",
                "https://presales15b.percipio.com",
                "https://presales16.percipio.com",
                "https://presales16a.percipio.com",
                "https://presales16b.percipio.com",
                "https://presales17.percipio.com",
                "https://presales17a.percipio.com",
                "https://presales17b.percipio.com",
                "https://presales18.percipio.com",
                "https://presales18a.percipio.com",
                "https://presales18b.percipio.com",
                "https://presales19.percipio.com",
                "https://presales19a.percipio.com",
                "https://presales19b.percipio.com",
                "https://presales20.percipio.com",
                "https://presales20a.percipio.com",
                "https://presales20b.percipio.com",
                "https://presales21.percipio.com",
                "https://presales21a.percipio.com",
                "https://presales21b.percipio.com",
                "https://presales22.percipio.com",
                "https://presales22a.percipio.com",
                "https://presales22b.percipio.com",
                "https://presales23.percipio.com",
                "https://presales23a.percipio.com",
                "https://presales23b.percipio.com",
                "https://presales24.percipio.com",
                "https://presales24a.percipio.com",
                "https://presales24b.percipio.com",
                "https://presales25.percipio.com",
                "https://presales25a.percipio.com",
                "https://presales25b.percipio.com",
                "https://proservices01.percipio.com",
                "https://proservices2.percipio.com",
                "https://proservices03.percipio.com",
                "https://proservices4.percipio.com",
                "https://proservices05.percipio.com",
                "https://proservices06.percipio.com",
                "https://proservices7.percipio.com",
                "https://proservices08.percipio.com",
                "https://proservices009.percipio.com",
                "https://proservices010.percipio.com",
                "https://proservices11.percipio.com",
                "https://proservices012.percipio.com",
                "https://proservices0013.percipio.com",
                "https://proservices014.percipio.com",
                "https://proservices15.percipio.com",
                "https://proservices016.percipio.com",
                "https://proservices0017.percipio.com",
                "https://proservices18.percipio.com",
                "https://proservices019.percipio.com",
                "https://proservices20.percipio.com",
                "https://proservices021.percipio.com",
                "https://proservices22.percipio.com",
                "https://proservices023.percipio.com",
                "https://proservices024.percipio.com",
                "https://proservices25.percipio.com",
                "https://proservices26.percipio.com",
                "https://proservices27.percipio.com",
                "https://proservices028.percipio.com",
                "https://proservices29.percipio.com",
                "https://proservices030.percipio.com",
                "https://proservices031.percipio.com",
                "https://proservices32.percipio.com",
                "https://proservices033.percipio.com",
                "https://proservices034.percipio.com",
                "https://proservices35.percipio.com",
                "https://proservices36.percipio.com",
                "https://proservices37.percipio.com",
                "https://proservices38.percipio.com",
                "https://proservices039.percipio.com",
                "https://proservices040.percipio.com",
                "https://proservices041.percipio.com",
                "https://proservices042.percipio.com",
                "https://proservices043.percipio.com",
                "https://proservices44.percipio.com",
                "https://proservices45.percipio.com",
                "https://proservices46.percipio.com",
                "https://proservices47.percipio.com",
                "https://proservices48.percipio.com",
                "https://smbsandbox.percipio.com",
                "https://testsi.percipio.com"
            ],
            description: 'Org URL. Required for TriggerInSingleOrg; ignored for multi-org.',
            name: 'url'
        ),
        choice(
            choices: ['', 'kowshik.bikkina@skillsoft.com', 'pareekshith.v@skillsoft.com', 'reegan.mcdougall@skillsoft.com', 'default_admin', 'kowshik1@example.com','Clayton.Crouch@skillsoft.com'],
            description: 'Admin email for org login.',
            name: 'adminUsername'
        ),
        password(
            description: 'Admin password.',
            name: 'adminPassword'
        ),
        choice(
            choices: ['prod', 'dev','preval'],
            description: 'Environment (config): prod, dev, or preval.',
            name: 'environment'
        ),
        choice(
            choices: [
                '',
                'addRoleAndAspirationRole',
                'addUsStrategicContentCollectionsAttribute',
                'addUsStrategicContentCollectionsAudiences',
                'addUsStrategicContentCollectionsLicencePools',
                'addUsStrategicSiteAdmins',
                'apiSafari',
                'appendAllOrgLicencePoolsToAudience',
                'appendNamedLicencePoolsToAudience',
                'checkLicencepoolsAndAppendToAudience',
                'checkLicencepoolsAndAppendToAudienceForChildSite',
                'completeAssignments',
                'createChildSites',
                'createChildSitesFromFile',
                'createChildSitesOnlyNew',
                'completeCoursesForExistingUsersAndEarnCourseBadges',
                'completeCoursesForMultipleUsersAndEarnCourseBadges',
                'completeSkillBenchmarkForSalesTeam',
                'convertLandingPageApiResponse',
                'countCustomJobRoles',
                'createArea',
                'createAreaWithSingleWorker',
                'createAreaWithSingleWorkerThenChannelsAndAppendToSubjects',
                'createAndShareContentToChildSites',
                'createAndShareContentToChildSitesByDomains',
                'createAndShareContentToChildSitesFromFile',
                'createAreaForChildSites',
                'createBannersForChildSites',
                'createAssignment',
                'createCertitudeCourses',
                'createChannelsAndAppendToSubjects',
                'createAkaraLXChannel',
                'createContentConfig',
                'createCustomContent',
                'createCustomLandingPages',
                'createDataInActivityDashboard',
                'createDataInAiCoachDashboard',
                'createDataInAiCoachForDefaultUsers',
                'CERT_PATH_1_createCertificationPathJourneys',
                'CERT_PATH_2_createDataInCertificationDashboard',
                'CERT_PATH_3_createStartedDataInCertificationDashboard',
                'CERT_PATH_4_createPracticingObtainingDataInCertificationDashboard',
                'CERT_PATH_5_createDefaultCertDataInCertificationDashboard',
                'CERT_PATH_REMOVE_removePublishedCertPaths',
                'createDataInLearningProgramDashboard',
                'createDataInManagerDashboard',
                'createDataInRiskAndReadinessAssessmentsSection',
                'createDataInRiskAndReadinessTimelinessSection',
                'createDataInSkillBenchmarkDashboard',
                'createDataInSkillBenchmarkDashboardGraph',
                'createDataInSkillBenchmarkDashboardWithAspiring',
                'createDataInSkillBenchmarkDashboardWithDeveloping',
                'createDataInSkillBenchmarkDashboardWithDevelopingForLB',
                'createDataInSkillBenchmarkDashboardWithExistingData',
                'createDataInSkillBenchmarkDashboardWithNovice',
                'createDataInSkillBenchmarkDashboardWithProficient',
                'createDataInSkillBenchmarkDashboardWithProficientForLB',
                'createDataInSkillsDiscoveryDashboard',
                'createDataInSkillsDiscoveryDashboardUsingCron',
                'createDefaultUsers',
                'createDynamicAndContentConfigAndCertitude',
                'createDynamicContent',
                'createFixedSkillBenchmarkDataForDefaultUsers',
                'createFrenchBanner',
                'createGermanBanner',
                'createGoals',
                'createILTLiveCourses',
                'createJapaneseBanner',
                'createJustBanner',
                'createLearningAdminAndCollectionLearners',
                'createLearningPrograms',
                'createLocaleBannerWithWorkers',
                'createMandarinChineseBanner',
                'createNewLabJourneys',
                'createPlaylistAndLiveCourses',
                'createPlaylistForExistingUsers',
                'createPlaylistsForSalesTeam',
                'uploadKnowledgeSource',
                'uploadKnowledgeSourceSpecific',
                'uploadMediaLibrary',
                'uploadMediaLibrarySpecific',
                'createPPTInLXStudios',
                'createPPTInLXStudiosMultiple',
                'createPPTInLXStudiosSpecific',
                'createConversationInLXStudios',
                'createConversationInLXStudiosMultiple',
                'createConversationInLXStudiosSpecific',
                'createAssessmentInLXStudios',
                'createAssessmentInLXStudiosMultiple',
                'createAssessmentInLXStudiosSpecific',
                'createCourseInLXStudios',
                'createCourseInLXStudiosAllOrgs',
                'createCourseInLXStudiosInConfigOrg',
                'createCourseInLXStudiosInParentSites',
                'createCourseInLXStudiosInAllChildSites',
                'createCourseInLXStudiosInEUParentSites',
                'createCourseInLXStudiosInEUAllSites',
                'createCourseInLXStudiosInEUChildSites',
                'createCourseInLXStudiosInUSParentSites',
                'createCourseInLXStudiosInUSAllSites',
                'createCourseInLXStudiosInUSChildSites',
                'updateCourseThumbnailAndKnowledgeSource',
                'updateCourseThumbnailAndKnowledgeSourceInConfigOrg',
                'updateCourseThumbnailAndKnowledgeSourceInParentSites',
                'updateCourseThumbnailAndKnowledgeSourceInChildSites',
                'deleteAllContainers',
                'deletePPTContainers',
                'deleteCaisyContainers',
                'deleteAssessmentContainers',
                'createRandomSkillBenchmarkDataForDefaultUsers',
                'createRegionAudienceAndAddAdmin',
                'createRiskAndReadinessTimelinessAssignments',
                'createSkillsIntelligencePersonaData',
                'createStrips',
                'createUserForAssignment',
                'createUsers',
                'createUserThenPlaylist',
                'cronJobCommand',
                'ucmDeactivateAllExceptKeepListFromOrg',
                'ucmDeactivateTerminatedFromSheet',
                'ucmHireAndDeactivateFromSheet',
                'ucmHireFromSheet',
                'ucmInactivateExternalUsersFromSiteForMonth',
                'ucmInactivateExternalUsersMonthlyCron',
                'earnBadgesForDefaultUsers',
                'earnBadgesForSaleTeam',
                'earnJourneyAndTrackBadgesAfterCreatingUsers',
                'earnJourneyAndTrackBadgesForDefaultUsers',
                'earnJourneyAndTrackBadgesForExistingUsers',
                'editAssignmentDashboard',
                'editAssignments',
                'editComplianceSettings',
                'editContentevalMphasisUsers',
                'editOrgSettings',
                'editUserInChildSite',
                'editUserInChildSiteFromFile',
                'editUserInChildSiteSpecific',
                'editProfileForDefaultUsers',
                'enableAiCoachSettings',
                'enableLxStudioAccessorForSkillsoftUsers',
                'enableSkillsIntelligenceSettings',
                'fullAiCoachCommand',
                'fullCommandForEditingAssignments',
                'fullLearningProgramCommand',
                'fullRiskAndReadinessInsightsSetupCommand',
                'getAllBadgesForCurrentUsers',
                'getPersonaUsersForCaisyDashboardTestData',
                'getUsersForCaisyDashboardFromAllOrgs',
                'getUsersForCaisyDashboardFromAllOrgsQuickTest',
                'getUsersForCaisyDashboardFromConfigOrg',
                'grantXpPointsForDefaultAndRandomUsers',
                'importCustomJobRoles',
                'increaseViewcountInActivityDashboard',
                'increaseVisitorsAndUCAInExecutiveDashboard',
                'initialSetup',
                'listAttributeCreation',
                'listChildSites',
                'mobileExecutiveDashboard',
                'populateDataInCaisyDashboard',
                'populateDataInFeatureUsageReport',
                'populateDataInLearnerFeedbackDashboard',
                'prevalChildSitesSetup',
                'publishCustomJobRoles',
                'removeAllAssignments',
                'removeAllCustomJobRoles',
                'removeAllCustomLandingPages',
                'removeAllLearningPrograms',
                'removeAreas',
                'removeAreasWithExistingContentLinked',
                'removeOnlyBanners',
                'removeOnlyChannels',
                'removeOnlyJourneys',
                'removeOnlyStrips',
                'removePlaylistForDefaultUsers',
                'removeStripsAndBannersAndAreasAndAssignments',
                'skillGainFromAspiringDeveloping',
                'skillGainFromNoviceAdvanced',
                'updateTracksForCustomJourneys',
                'waitThenPublishCustomJobRoles'
            ],
            description: 'npm script to run. Must match a script name in package.json (e.g. createUsers, initialSetup).',
            name: 'command'
        ),
        choice(
            choices: ['TriggerInSingleOrg', 'presalesParentSites', 'allParentSites', 'presalesChildSites', 'presalesAseries', 'presalesBseries', 'TriggerInProservicesSites', 'TriggerInPlatformEval', 'TriggerInAllSites'],
            description: 'Single org (use URL) | presales parent sites | all parent sites | child/A-series/B-series | proservices | platform eval | all sites.',
            name: 'singleOrMultipleOrgs'
        ),
        string(
            defaultValue: '',
            description: 'Multi-org only: comma-separated sites (e.g. presales1,platformeval09). Empty = all for that trigger.',
            name: 'sitesFilter'
        ),
        string(
            defaultValue: null,
            description: 'Override: custom test command instead of command. Do not set both.',
            name: 'test'
        )
    ])
])

// Global variables - will be loaded from JSON inside pipeline
def (orgsAndUrls, orgMapping, urlToOrgIdMap, hourMapping, commandInfo) = [[:], [:], [:], [:], []]
def imageName = 'sales-test-data'
def containerName = 'sales-test-data-container'
def jenkinsConfig = null
def json_file = "./config/${params.environment}.json"
def today = new Date()
def dayFormat = new java.text.SimpleDateFormat("dd")
def hourFormat = new java.text.SimpleDateFormat("HH")
def currentDay = dayFormat.format(today)
def currentHour = hourFormat.format(today)
def shouldExecute = true

def getOrgDetails(orgMapping, currentHour, currentDay, hourMapping) {
    def timeKey = hourMapping[currentHour]
    return orgMapping[currentDay][timeKey]
}

def isCronTriggered() {
    return currentBuild.getBuildCauses('hudson.triggers.TimerTrigger$TimerTriggerCause').size() != 0
}

// Match Jenkins cron timezone (UTC). Agent local time is IST — do not use new Date() without UTC here.
def isMonthlyExternalUsersCron() {
    def utc = TimeZone.getTimeZone("UTC")
    def dayFmt = new java.text.SimpleDateFormat("dd")
    def hourFmt = new java.text.SimpleDateFormat("HH")
    dayFmt.setTimeZone(utc)
    hourFmt.setTimeZone(utc)
    def now = new Date()
    def day = dayFmt.format(now)
    def hour = hourFmt.format(now)
    echo "Monthly cron check (UTC): day=${day} hour=${hour}"
    // Production: 6th of month, hour 02 UTC (= 8:00 AM IST; cron fires at :30).
    return day == '06' && hour == '02'
}

// Filter orgs based on site type (presalesParent / allParent / child / aseries / bseries / proservices / platformeval)
def filterOrgsBySiteType(urlToOrgIdMap, siteType) {
    def filteredOrgs = [:]
    
    urlToOrgIdMap.each { url, orgId ->
        def orgName = url.replaceAll('https://','').replaceAll('.percipio.com','')
        // Numbered presales children only (presales1a / presales1b).
        def isAseriesChildSite = orgName.matches('^presales[0-9]+a$')
        def isBseriesChildSite = orgName.matches('^presales[0-9]+b$')
        def isChildSite = isAseriesChildSite || isBseriesChildSite
        // Proservices sites start with 'proservice'
        def isProservicesSite = orgName.startsWith('proservice')
        // Platform eval sites (only those listed in urlToOrgIdMap, e.g. platformeval09, 010, 011, 12)
        def isPlatformEvalSite = orgName.startsWith('platformeval')
        // Numbered presales parents only (presales1–presales25), not *a/*b children
        def isPresalesParentSite = orgName.matches('^presales[0-9]+$')
        
        if (siteType == 'presalesParent' && isPresalesParentSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'allParent' && !isChildSite && !isProservicesSite && !isPlatformEvalSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'child' && isChildSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'aseries' && isAseriesChildSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'bseries' && isBseriesChildSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'proservices' && isProservicesSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'platformeval' && isPlatformEvalSite) {
            filteredOrgs[url] = orgId
        } else if (siteType == 'all') {
            filteredOrgs[url] = orgId
        }
    }
    
    return filteredOrgs
}

/**
 * Optionally restricts filteredOrgs to only sites listed in sitesFilterParam.
 * Accepts comma-separated site names or full URLs (e.g. presales1,https://platformeval09.percipio.com).
 * @param filteredOrgs Map of url -> orgId (e.g. from filterOrgsBySiteType)
 * @param sitesFilterParam Optional comma-separated list; empty/null = return filteredOrgs unchanged
 * @return Same map if param empty, else map containing only entries whose org name is in the list
 */
def applySitesFilter(Map filteredOrgs, String sitesFilterParam) {
    if (!sitesFilterParam?.trim()) return filteredOrgs
    def tokens = sitesFilterParam.split(',').collect { it.trim() }.findAll { it }
    def selectedNames = tokens.collect { token ->
        if (token.contains('percipio.com')) {
            token.replaceAll('https://','').replaceAll('http://','').replaceAll('.percipio.com','').trim()
        } else {
            token
        }
    }.findAll { it }
    if (!selectedNames) return filteredOrgs
    def result = filteredOrgs.findAll { url, orgId ->
        def orgName = url.replaceAll('https://','').replaceAll('.percipio.com','')
        orgName in selectedNames
    }
    def matchedNames = result.collect { url, orgId ->
        url.replaceAll('https://','').replaceAll('.percipio.com','')
    }
    def unmatchedNames = selectedNames.findAll { name -> !(name in matchedNames) }
    echo "Sites filter: requested ${selectedNames.size()} site(s): ${selectedNames}"
    if (unmatchedNames) {
        echo "Sites filter: ${unmatchedNames.size()} name(s) not in Jenkins org map, skipped: ${unmatchedNames}"
    }
    echo "Sites filter: running on ${result.size()} org(s): ${matchedNames}"
    return result
}

/**
 * Checks disk space and performs cleanup if usage exceeds 80%
 * Uses external shell script for reliability
 * @param context Optional context message for logging (e.g., "Multi-Org 5/25")
 * @return Current disk usage percentage
 * 
 * Safety: This method does NOT delete:
 * - Current test artifacts (playwright-report, test-results, Logs)
 * - Recent archived reports (< 7 days old)
 * - Running Docker containers
 */
def checkAndCleanDiskSpace(String context = "") {
    def diskUsage = sh(
        script: "./scripts/jenkins/check-and-clean-diskspace.sh '${context}'",
        returnStdout: true
    ).trim().split('\n').last().toInteger()
    
    return diskUsage
}

/**
 * Checks EC2 agent health and waits for it to come back online if needed
 * Uses external shell script for reliability
 * @param context Optional context message for logging (e.g., "Multi-Org 5/25")
 * @return true if agent is healthy, false if agent is offline
 * 
 * Behavior:
 * - Checks if agent is responsive
 * - If offline, waits up to 10 retries (30s each = 5 min max)
 * - Returns false if agent never recovers (caller should skip that iteration)
 */
def checkAgentHealth(String context = "") {
    def result = sh(
        script: "./scripts/jenkins/check-agent-health.sh '${context}'",
        returnStatus: true
    )
    return result == 0  // 0 = healthy, 1 = offline
}

/**
 * Checks agent health with persistent retry logic
 * Tries up to 2 times with a short wait period before giving up
 * @param context Context message for logging (e.g., "Multi-Org 5/80" or "Cron: createUsers 3/10")
 * @return true if agent becomes healthy, false if permanently offline
 * 
 * Wait Strategy:
 * - Attempt 1: 5 min (shell script retries)
 * - Wait 1 min, then Attempt 2: 5 min
 * - Total: ~11 minutes before giving up
 */
def checkAgentHealthWithRetry(String context = "") {
    def agentHealthy = false
    def maxAgentRetries = 2
    def agentRetryCount = 0
    
    while (!agentHealthy && agentRetryCount < maxAgentRetries) {
        agentRetryCount++
        agentHealthy = checkAgentHealth("${context} (Attempt ${agentRetryCount}/${maxAgentRetries})")
        
        if (!agentHealthy && agentRetryCount < maxAgentRetries) {
            def waitMinutes = 1  // Just 1 minute between retries
            echo "⏳ Agent still unhealthy. Waiting ${waitMinutes} minute before retry ${agentRetryCount + 1}..."
            sleep(time: waitMinutes, unit: 'MINUTES')
        }
    }
    
    if (!agentHealthy) {
        echo "❌ CRITICAL: Agent failed to recover after ${maxAgentRetries} attempts (total ~11min wait)"
    }
    
    return agentHealthy
}

pipeline {
    agent {
        label 'innrd87'
    }
    stages {
        stage('🔧 Setup: Load Config & Prepare Scripts') {
            when {
                expression {
                    shouldExecute == true && (isCronTriggered() || params.url || params.command || params.test)
                }
            }
            steps {
                script {
                    // Load Jenkins configuration from JSON file using readJSON (returns serializable objects)
                    jenkinsConfig = readJSON file: './testData/jenkins/jenkins-config.json'
                    commandInfo = jenkinsConfig.commandInfo
                    orgMapping = jenkinsConfig.orgMapping
                    urlToOrgIdMap = jenkinsConfig.urlToOrgIdMap
                    hourMapping = jenkinsConfig.hourMapping
                    echo "✅ Configuration loaded from JSON"
                    // Make shell scripts executable
                    sh 'chmod +x ./scripts/jenkins/*.sh'
                    echo "✅ Scripts prepared"
                }
            }
        }
        stage('🔍 Cron: Verify Branch is Develop') {
            when {
                expression {
                    isCronTriggered() && env.BRANCH_NAME != 'develop'
                }
            }
            steps {
                script {
                    echo "Not on dev branch. Current branch is ${env.BRANCH_NAME}. Exiting cron job."
                    currentBuild.result = 'SUCCESS'
                    shouldExecute = false
                }
            }
        }
        stage('🎯 Manual: Map URL to Org ID') {
            when {
                expression {
                    !isCronTriggered() && params.url && params.singleOrMultipleOrgs == 'TriggerInSingleOrg'
                }
            }
            steps {
                script {
                    env.ORG_ID = urlToOrgIdMap[params.url]
                    echo "Org: ${params.url} → ${env.ORG_ID}"
                }
            }
        }
        stage('🔐 Docker: Login to ECR & Check Agent') {
            when {
                expression {
                    shouldExecute == true && (
                        isCronTriggered() || 
                        params.url || 
                        params.command || 
                        params.test
                    )
                }
            }
            steps {
                script {
                    // Check EC2 agent health (initial check)
                    checkAgentHealth("Initial Login")
                    login()
                }
            }
        }
        stage('⚙️ Manual: Update Config with Org Details') {
            when {
                expression {
                    !isCronTriggered() && params.url && params.singleOrMultipleOrgs == 'TriggerInSingleOrg'
                }
            }
            steps {
                script {
                    sh """
                        set +x  # Disable command echoing to hide password
                        ./scripts/jenkins/update-json-config.sh '${json_file}' '${params.url}' '${env.ORG_ID}' '${params.adminUsername}' '${params.adminPassword}'
                        set -x  # Re-enable command echoing
                    """
                }
            }
        }
        stage('🐳 Docker: Build Test Image') {
            when {
                expression {
                    shouldExecute == true && (isCronTriggered() || params.url || params.command || params.test)
                }
            }
            steps {
                script {
                    echo "Building Docker image..."
                    sh "./scripts/jenkins/build-docker-image.sh ${imageName}"
                }
            }
        }
        stage('📁 Manual: Prepare Test Directories') {
            when {
                expression {
                    !isCronTriggered() && (params.url || params.command || params.test)
                }
            }
            steps {
                script {
                   
                    sh './scripts/jenkins/prepare-test-dirs.sh'
                }
            }
        }
        stage('🚀 Execute: Manual Tests (Single/Multi Org)') {
            when {
                expression {
                    !isCronTriggered() && (params.url || params.command || params.test)
                }
            }
            steps {
                timeout(time: 480, unit: 'MINUTES') {
                    script {
                        if (params.command in ['createCourseInLXStudiosInEUParentSites', 'createCourseInLXStudiosInEUAllSites', 'createCourseInLXStudiosInEUChildSites', 'createCourseInLXStudiosInUSParentSites', 'createCourseInLXStudiosInUSAllSites', 'createCourseInLXStudiosInUSChildSites']) {
                            // EU/US course commands: spec iterates orgs; run once
                            echo "🔄 Running once: ${params.command} (spec will iterate EU/US orgs)"
                            sh "./scripts/jenkins/run-docker-tests.sh '${imageName}' '${containerName}' '${params.environment}' 'npm run ${params.command}'"
                        } else if (params.singleOrMultipleOrgs == 'presalesParentSites' ||
                            params.singleOrMultipleOrgs == 'allParentSites' ||
                            params.singleOrMultipleOrgs == 'presalesChildSites' || 
                            params.singleOrMultipleOrgs == 'presalesAseries' || 
                            params.singleOrMultipleOrgs == 'presalesBseries' || 
                            params.singleOrMultipleOrgs == 'TriggerInProservicesSites' ||
                            params.singleOrMultipleOrgs == 'TriggerInPlatformEval' ||
                            params.singleOrMultipleOrgs == 'TriggerInAllSites') {
                            
                            // Determine site type and filter orgs accordingly
                            def siteType = 'all'
                            def siteTypeLabel = 'all sites'
                            
                            if (params.singleOrMultipleOrgs == 'presalesParentSites') {
                                siteType = 'presalesParent'
                                siteTypeLabel = 'presales parent sites only'
                            } else if (params.singleOrMultipleOrgs == 'allParentSites') {
                                siteType = 'allParent'
                                siteTypeLabel = 'all parent sites'
                            } else if (params.singleOrMultipleOrgs == 'presalesChildSites') {
                                siteType = 'child'
                                siteTypeLabel = 'presales child sites (A-series and B-series)'
                            } else if (params.singleOrMultipleOrgs == 'presalesAseries') {
                                siteType = 'aseries'
                                siteTypeLabel = 'presales A-series child sites only'
                            } else if (params.singleOrMultipleOrgs == 'presalesBseries') {
                                siteType = 'bseries'
                                siteTypeLabel = 'presales B-series child sites only'
                            } else if (params.singleOrMultipleOrgs == 'TriggerInProservicesSites') {
                                siteType = 'proservices'
                                siteTypeLabel = 'proservices sites only'
                            } else if (params.singleOrMultipleOrgs == 'TriggerInPlatformEval') {
                                siteType = 'platformeval'
                                siteTypeLabel = 'platform eval sites only'
                            }
                            
                            def filteredOrgs = filterOrgsBySiteType(urlToOrgIdMap, siteType)
                            filteredOrgs = applySitesFilter(filteredOrgs, params.sitesFilter)
                            
                            // Track success and failure for each org
                            def failedOrgs = [:]
                            def successfulOrgs = []
                            def orgCounter = 0
                            def totalOrgs = filteredOrgs.size()
                            
                            echo "🔄 Starting multi-org execution for ${totalOrgs} orgs (${siteTypeLabel})"
                            
                            // Loop through each filtered org and execute tests
                            filteredOrgs.each { url, orgId ->
                                orgCounter++
                                def orgName = url.replaceAll('https://','').replaceAll('.percipio.com','')
                                def timestamp = new Date().format('HHmmss')
                                def startTime = System.currentTimeMillis()
                                
                                // Check agent health and disk space before EVERY org during multi-org execution
                                def agentHealthy = checkAgentHealthWithRetry("Multi-Org ${orgCounter}/${totalOrgs}")
                                if (!agentHealthy) {
                                    echo "   Skipping ${orgName} and continuing with next org"
                                    failedOrgs[orgName] = "Agent permanently offline - skipped after 10min wait"
                                    return  // Skip this org
                                }
                                checkAndCleanDiskSpace("Progress: ${orgCounter}/${totalOrgs}")
                                
                                echo "▶️ [${orgCounter}/${totalOrgs}] Running tests for: ${orgName}"
                                try {
                                    sh """
                                        set +x  # Disable command echoing to hide password
                                        ./scripts/jenkins/update-json-config.sh '${json_file}' '${url}' '${orgId}' '${params.adminUsername}' '${params.adminPassword}'
                                        set -x  # Re-enable command echoing
                                    """
                                    timeout(time: 30, unit: 'MINUTES') {
                                        sh "./scripts/jenkins/run-docker-tests.sh '${imageName}' '${containerName}' '${params.environment}' 'npm run ${params.command}'"
                                    }
                                    sh "./scripts/jenkins/preserve-reports.sh '${orgName}_${timestamp}'"
                                    successfulOrgs.add(orgName)
                                    def duration = (System.currentTimeMillis() - startTime) / 1000
                                    echo "✅ Completed: ${orgName} (⏱️ ${duration}s)"
                                } catch (e) {
                                    // Continue to next org instead of failing entire build
                                    def duration = (System.currentTimeMillis() - startTime) / 1000
                                    def errorReason = e.message ?: "Unknown error"
                                    echo "❌ Error for ${orgName}: ${errorReason}"
                                    echo "   Full error details: ${e.toString()}"
                                    echo "   Duration before failure: ${duration}s"
                                    failedOrgs[orgName] = errorReason
                                } finally {
                                    // Cleanup container and prune stopped containers/volumes
                                    sh "./scripts/jenkins/cleanup-container.sh '${containerName}'"
                                }
                            }
                            
                            // Aggressive cleanup after all orgs complete
                            echo "\n🧹 Performing final cleanup after all orgs..."
                            sh "docker system prune -a -f --volumes > /dev/null 2>&1 || true"
                            
                            // Print execution summary
                            echo "\n📊 EXECUTION SUMMARY"
                            echo "===================="
                            echo "✅ Successful orgs (${successfulOrgs.size()}): ${successfulOrgs.join(', ')}"
                            if (failedOrgs.size() > 0) {
                                echo "\n❌ Failed orgs (${failedOrgs.size()}):"
                                failedOrgs.each { orgName, errorReason ->
                                    echo "   • ${orgName}: ${errorReason}"
                                }
                            }
                            // Set build status based on results
                            if (failedOrgs.size() > 0) {
                                if (successfulOrgs.size() > 0) {
                                    currentBuild.result = 'UNSTABLE'
                                    echo "\n⚠️ Build marked as UNSTABLE - Some orgs failed"
                                } else {
                                    currentBuild.result = 'FAILURE'
                                    echo "\n🚫 Build marked as FAILURE - All orgs failed"
                                }
                            } else {
                                echo "\n🎉 All orgs passed successfully!"
                            }
                        } else if (params.singleOrMultipleOrgs == 'TriggerInSingleOrg') {
                            try {
                                def dockerCommand = ""
                                if (params.test && params.command) {
                                    error("Both 'test' and 'command' parameters provided. Use only one.")
                                } else if (params.test) {
                                    dockerCommand = params.test
                                    echo "Executing custom test command"
                                } else if (params.command && params.url == '') {
                                    dockerCommand = "npm run ${params.command}"
                                    echo "Executing command: ${params.command}"
                                } else if (params.url && env.ORG_ID && params.adminUsername && params.adminPassword && params.command) {
                                    dockerCommand = "npm run ${params.command}"
                                    echo "Executing for org: ${params.url}"
                                } else {
                                    error('No valid command or parameters provided. Check your build parameters.')
                                }
                                sh "./scripts/jenkins/run-docker-tests.sh '${imageName}' '${containerName}' '${params.environment}' '${dockerCommand}'"
                                def reportCount = sh(script: "./scripts/jenkins/count-files.sh playwright-report", returnStdout: true).trim()
                                def resultCount = sh(script: "./scripts/jenkins/count-files.sh test-results", returnStdout: true).trim()
                                def logCount = sh(script: "./scripts/jenkins/count-files.sh Logs", returnStdout: true).trim()
                                echo "✅ Test execution completed"
                                echo "   Reports: ${reportCount} files | Results: ${resultCount} files | Logs: ${logCount} files"
                            } catch (e) {
                                if (e.message.contains('No valid command')) {
                                    error("❌ ${e.message}")
                                } else {
                                    echo "❌ Test execution failed: ${e.message}"
                                    currentBuild.result = 'FAILURE'
                                }
                            } finally {
                                // Cleanup container and prune stopped containers/volumes
                                sh "./scripts/jenkins/cleanup-container.sh '${containerName}'"
                            }
                        }
                        // Cleanup unused Docker resources (runs after any execution path)
                        sh "docker system prune -a -f --volumes > /dev/null 2>&1 || true"
                    }
                }
            }
        }
        stage("⏰ Cron: Get Org for Current Day/Hour") {
            when {
                expression {
                    // Skip bimonthly org lookup when this is the monthly external-users cron
                    isCronTriggered() && shouldExecute == true && !isMonthlyExternalUsersCron()
                }
            }
            steps {
                script {
                    try {
                        orgsAndUrls = getOrgDetails(orgMapping, currentHour, currentDay, hourMapping)
                        echo "Initialized - Day: ${currentDay}, Hour: ${currentHour}, Org: ${orgsAndUrls.url}"
                    } catch (error) {
                        echo "⚠️ No org mapping for day:${currentDay} hour:${currentHour}"
                        echo "Error details: ${error.message}"
                        orgsAndUrls = []
                    }
                }
            }
        }
        stage("🔄 Execute: Monthly External Users Cron") {
            when {
                expression {
                    isCronTriggered() && shouldExecute == true && isMonthlyExternalUsersCron()
                }
            }
            steps {
                script {
                    // Sites + month math live in the npm runner (runtimeOrg + monthlyExternalUserSites.json)
                    def cronEnv = "prod"
                    def monthlyCmd = "ucmInactivateExternalUsersMonthlyCron"
                    echo "▶️ Monthly external-users cron (IST day 6 ~8:00 AM) — ${monthlyCmd}"
                    try {
                        sh './scripts/jenkins/prepare-test-dirs.sh'
                        def agentHealthy = checkAgentHealthWithRetry("Cron: ${monthlyCmd}")
                        if (!agentHealthy) {
                            echo "⚠️ Skipping ${monthlyCmd} — agent unhealthy"
                        } else {
                            checkAndCleanDiskSpace("Cron: ${monthlyCmd}")
                            def timestamp = new Date().format('HHmmss')
                            def reportName = "${monthlyCmd}_${timestamp}"
                            // Long run: export + inactivate across listed sites
                            timeout(time: 180, unit: 'MINUTES') {
                                sh "./scripts/jenkins/run-docker-tests.sh '${imageName}' '${containerName}' '${cronEnv}' 'npm run ${monthlyCmd}'"
                            }
                            sh "./scripts/jenkins/preserve-reports.sh '${reportName}'"
                            echo "✅ ${monthlyCmd} completed"
                        }
                    } catch (error) {
                        echo "⚠️ ${monthlyCmd} failed: ${error.message}"
                    } finally {
                        sh "./scripts/jenkins/cleanup-container.sh '${containerName}'"
                        sh "docker system prune -a -f --volumes > /dev/null 2>&1 || true"
                    }
                }
            }
        }
        stage("🔄 Execute: Automated Cron Tests") {
            when {
                expression {
                    // Existing bimonthly demo-data cron only (not monthly external-users)
                    isCronTriggered() && shouldExecute == true && !isMonthlyExternalUsersCron()
                }
            }
            steps {
                script {
                    try {
                        // Hardcoded credentials for cron job
                        def adminEmail = "kowshik.bikkina@skillsoft.com"
                        def adminPwd = "P@ssw0rd123@"
                        def env = "prod"
                        if (!orgsAndUrls.isEmpty()) {
                            sh './scripts/jenkins/prepare-test-dirs.sh'
                            def specificURL = orgsAndUrls.url
                            def orgId = orgsAndUrls.orgId
                            echo "▶️ Cron Job - Running for: ${specificURL} (Hour: ${currentHour})"
                            sh """
                                set +x  # Disable command echoing to hide password
                                ./scripts/jenkins/update-json-config.sh '${json_file}' '${specificURL}' '${orgId}' '${adminEmail}' '${adminPwd}'
                                set -x  # Re-enable command echoing
                            """
                            // Execute each command based on commandInfo configuration
                            def totalCommands = commandInfo.size()
                            def commandCounter = 0
                            
                            commandInfo.each { cmd ->
                                commandCounter++
                                def counter = cmd.counter
                                def numbers = (1..counter).toList()
                                
                                echo "📋 [Command ${commandCounter}/${totalCommands}] ${cmd.command} - will run ${counter} time(s)"
                                
          numbers.each { i ->
                                   // Check agent health and disk space before each command iteration in cron job
                                   def agentHealthy = checkAgentHealthWithRetry("Cron: ${cmd.command} ${i}/${counter}")
                                   if (!agentHealthy) {
                                       echo "   Skipping ${cmd.command} (${i}/${counter}) and continuing with next iteration"
                                       return  // Skip this iteration
                                   }
                                   checkAndCleanDiskSpace("Cron: ${cmd.command} ${i}/${counter}")
                                    
                                    def timestamp = new Date().format('HHmmss')
                                    def reportName = "${cmd.command}_${timestamp}"
                                    echo "  ▶️ ${cmd.command} (${i}/${counter}) - timeout: ${cmd.timeout}m"
                                    try {
                                        timeout(time: cmd.timeout, unit: 'MINUTES') {
                                            sh "./scripts/jenkins/run-docker-tests.sh '${imageName}' '${containerName}' '${env}' 'npm run ${cmd.command}'"
                                        }
                                        sh "./scripts/jenkins/preserve-reports.sh '${reportName}'"
                                        echo "  ✅ ${cmd.command} completed"
                                    } catch (error) {
                                        echo "  ⚠️ ${cmd.command} failed: ${error.message}"
                                    } finally {
                                        // Cleanup container and prune stopped containers/volumes
                                        sh "./scripts/jenkins/cleanup-container.sh '${containerName}'"
                                    }
                                }
                            }
                            sh "docker system prune -a -f --volumes > /dev/null 2>&1 || true"
                            echo "✅ Cron job completed for ${specificURL}"
                        } else {
                            echo "⚠️ No URLs scheduled for day:${currentDay} hour:${currentHour}"
                        }
                    } catch (error) {
                        echo "❌ Cron job failed: ${error.message}"
                    }
                }
            }
        }
        stage('📦 Finalize: Archive Reports & Publish') {
            when {
                expression {
                    shouldExecute == true && (isCronTriggered() || params.url || params.command || params.test)
                }
            }
            steps {
                script {
                    // Count files in different report directories
                    def reportCount = sh(script: "./scripts/jenkins/count-files.sh playwright-report", returnStdout: true).trim()
                    def resultCount = sh(script: "./scripts/jenkins/count-files.sh test-results", returnStdout: true).trim()
                    def logCount = sh(script: "./scripts/jenkins/count-files.sh Logs", returnStdout: true).trim()
                    def archivedCount = sh(script: "find archived-reports -type f 2>/dev/null | wc -l", returnStdout: true).trim()
                    // Archive preserved reports from multiple commands/orgs if they exist
                    if (archivedCount.toInteger() > 0) {
                        def reportDirs = sh(script: "find archived-reports -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l", returnStdout: true).trim()
                        echo "📦 Archiving ${reportDirs} report sets (${archivedCount} total files)"
                        try {
                            archiveArtifacts(
                                artifacts: 'archived-reports/**/*',
                                allowEmptyArchive: true,
                                fingerprint: false,
                                onlyIfSuccessful: false
                            )
                            echo "✅ All reports archived (${reportDirs} separate executions preserved)"
                        } catch (Exception e) {
                            echo "⚠️ Archived reports failed: ${e.message}"
                        }
                    }
                    // Remove .gitkeep files before archiving
                    sh 'find playwright-report test-results Logs -name ".gitkeep" -type f -delete 2>/dev/null || true'
                    // Archive latest test results
                    try {
                        archiveArtifacts(
                            artifacts: 'playwright-report/**, test-results/**, Logs/**', 
                            allowEmptyArchive: true,
                            fingerprint: false,
                            onlyIfSuccessful: false,
                            excludes: '**/.gitkeep'
                        )
                        echo "✅ Artifacts archived"
                    } catch (Exception e) {
                        echo "⚠️ Archive failed: ${e.message}"
                    }
                    // Publish HTML report if it exists
                    if (fileExists('playwright-report/index.html')) {
                        try {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'playwright-report',
                                reportFiles: 'index.html',
                                reportName: 'Playwright Test Report',
                                reportTitles: 'Test Execution Report',
                                escapeUnderscores: false,
                                includes: '**/*'
                            ])
                            echo "✅ HTML report published - View via 'Playwright Test Report' link in sidebar"
                        } catch (Exception e) {
                            echo "⚠️ HTML publish failed: ${e.message}"
                        }
                    }
                }
            }
        }
    }
    post {
        success {
            script {
                echo "✅ Success - All tests passed"
            }
        }
        unstable {
            script {
                echo "⚠️ Unstable - Some tests failed, check console for details"
            }
        }
        failure {
            script {
                echo "❌ Failed - Check logs for details"
            }
        }
    }
}