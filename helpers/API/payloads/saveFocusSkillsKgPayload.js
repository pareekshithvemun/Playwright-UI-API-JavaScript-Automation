// Replaces the focus skills on one role. Order is the order on the sheet.
export function saveFocusSkillsKgPayload(jobRoleId, skillIds) {
  return [
    {
      operationName: "saveAllKGFocusSkills",
      variables: {
        jobRoleId,
        skillIds,
      },
      query: `mutation saveAllKGFocusSkills($jobRoleId: ID!, $skillIds: [ID!]!) {
        skilzSaveAllKGFocusSkills(jobRoleId: $jobRoleId, skillIds: $skillIds)
      }`,
    },
  ];
}
