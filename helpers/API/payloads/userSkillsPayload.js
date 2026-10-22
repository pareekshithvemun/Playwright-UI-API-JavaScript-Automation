export function userSkillsPayload(roleid) {
  return [
    {
      operationName: "userFocusSkills",
      variables: {
        locale: "en-US",
        jobRoleId: roleid,
      },
      query:
        "query userFocusSkills($jobRoleId: ID!, $locale: String) {\n  skilzUserFocusSkills(locale: $locale, jobRoleId: $jobRoleId) {\n    skillId\n    skillName\n    skillDesc\n    selfRating\n    targetRating\n    explanation\n    __typename\n  }\n}\n",
    },
  ];
}
