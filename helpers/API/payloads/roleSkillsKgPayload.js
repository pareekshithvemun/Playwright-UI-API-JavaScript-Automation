// Skills on one role, opened from the Career role page. Names are matched in the spec.
export function roleSkillsKgPayload(jobRoleId) {
  return [
    {
      operationName: "roleInfoWithSkillsKg",
      variables: {
        jobRoleId,
        locale: "en-US",
      },
      query: `query roleInfoWithSkillsKg($jobRoleId: ID!, $locale: String!) {
        skilzRoleSkillsWithUserRating: skilzRoleKGSkillsWithUserRating(
          jobRoleId: $jobRoleId
          locale: $locale
        ) {
          jobRoleUuid
          jobRoleName
          skills {
            id
            name
            targetRating
            rating
          }
        }
      }`,
    },
  ];
}
