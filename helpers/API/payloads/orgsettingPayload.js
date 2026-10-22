export function orgSettingsPayLoad(
  LiveCourseVisibility,
  BenchmarkCompletionIntervalInDays,
  percentageOfAssessmentRequiredForCourseCompletion,
  nameOfCustomAreaSection
) {
  let skillBenchmarkCompletionIntervalInMinutes =
    BenchmarkCompletionIntervalInDays * 1440;
  return {
    customMenuCategoryName: { "en-US": nameOfCustomAreaSection },
    viewingAllVideosMarksCourseComplete: true,
    viewAllVideosAndGetMinAssessmentScoreToCompleteCourse: false,
    percentageOfAssessmentRequiredForCourseCompletion:
      percentageOfAssessmentRequiredForCourseCompletion,
    enableCompletionCertificates: true,
    enableHostedCustomCourseCertificates: true,
    skillBenchmarkCompletionIntervalInMinutes:
      skillBenchmarkCompletionIntervalInMinutes,
    skillBenchmarkCompletionIntervalOverride: true,
    enableTimeTracking: false,
    enableGKLiveCourseRegistrations: true,
    gkClassVisibility: "fullaccess",
    enableACC: true,
    disabledACCLanguages: [],
    gkLiveCourseVisibility: LiveCourseVisibility,
    enableLocalizedSearchWithEnglishContent: true,
    enableEnglishQuickBrowseLanguage: true,
    enablePlaybackSpeedControl: true,
    autoCancelInactiveUserRegs: false,
    enableUserLoggingForCaisy: true,
    enableOrgLoggingForCaisy: false,
  };
}
