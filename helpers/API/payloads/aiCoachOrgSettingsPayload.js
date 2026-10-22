// AI Coach keys only — do not send the shared org-settings body.
export function aiCoachOrgSettingsPayload(performanceCycleDates) {
  return {
    enableAICoach: true,
    allowFeedbackRequests: true,
    allowOnlyManagersForFeedback: false,
    allowColleaguesAndManagersForFeedback: true,
    displayManagerFeedbackSeparately: true,
    minColleaguesRequiredForFeedback: 1,
    enableAICoachForAllLearners: true,
    aiCoachAudiences: [],
    allowPulseChecks: true,
    allowSelfPulseChecks: true,
    allowManagerPulseChecks: true,
    selfPulseCheckFrequencyDays: 60,
    performanceCycleDates,
  };
}
