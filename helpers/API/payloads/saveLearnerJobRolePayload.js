// Same save the Career page uses. Order 1 is the current role. Order 2 is the next role.
export function saveLearnerJobRolePayload(jobRoleUuid, order) {
  return [
    {
      operationName: "saveUserJobRoleV2",
      variables: {
        jobRoleUuid,
        order,
      },
      query: `mutation saveUserJobRoleV2($jobRoleUuid: ID, $order: Int) {
        skilzSaveUserJobRole(jobRoleUuid: $jobRoleUuid, order: $order)
      }`,
    },
  ];
}
