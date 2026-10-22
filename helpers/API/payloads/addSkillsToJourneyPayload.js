export function addSkillsToJourneyPayload(skillIds) {
  return {
    requiredCompletionType: "NONE",
    removeEnglishFirst: true,
    skills: skillIds
  };
}
