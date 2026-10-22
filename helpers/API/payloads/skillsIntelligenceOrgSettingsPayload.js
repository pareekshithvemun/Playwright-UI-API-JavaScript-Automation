// Career Center keys only. Do not send the shared org-settings body.
export function skillsIntelligenceOrgSettingsPayload() {
  return {
    sklzEnableCareerCenter: true,
    enableCareerExplorer: true,
    sklzEnableSubway: true,
    enableSunburst: true,
    // 2 is Custom job roles only on the Career Center card.
    sklzJobRoleSelectionOptions: 2,
    sklzEnableAspirationalRole: true,
    sklzEnableMentoring: true,
  };
}
