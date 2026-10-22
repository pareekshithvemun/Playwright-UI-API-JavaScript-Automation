export function getSimilarJobRolesPayload(jobRoleUuid) {
  return [
    {
      operationName: "suggestedAspirationalJobroles",
      variables: {
        locale: "en-US",
        jobRoleUuid: jobRoleUuid,
        suppressStock: false,
      },
      query:
        "query suggestedAspirationalJobroles($locale: String!, $jobRoleUuid: ID!, $limit: Int, $suppressStock: Boolean) {\n  skilzSuggestedAspirationalJobroles(\n    locale: $locale\n    jobRoleUuid: $jobRoleUuid\n    limit: $limit\n    suppressStock: $suppressStock\n  ) {\n    jobRoleName\n    jobRoleUuid\n    commonSkillsCount\n    __typename\n  }\n}\n",
    },
  ];
}
