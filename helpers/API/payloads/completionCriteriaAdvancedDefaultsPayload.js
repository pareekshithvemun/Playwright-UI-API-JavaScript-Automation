export function completionCriteriaAdvancedDefaultsPayload(settings = {}) {
  return {
    preTestAvailability: settings.preTestAvailability ?? false,
    minTimeInCourseChecked: settings.minTimeInCourseChecked ?? false,
    requireQuestionCompletion: settings.requireQuestionCompletion ?? false,
    viewAllCourses: settings.viewAllCourses ?? false,
    enableVideoSettings: settings.enableVideoSettings ?? true,
    allowFastForwarding: settings.allowFastForwarding ?? true,
    playbackSpeedChecked: settings.playbackSpeedChecked ?? false,
    playbackSpeed: settings.playbackSpeed ?? 1,
    disabledFullscreenMobile: settings.disabledFullscreenMobile ?? false,
    enableSelfMonitoring: settings.enableSelfMonitoring ?? false,
  };
}
