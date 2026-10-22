export function setAspirationJobRolePayload(jobRoleUuid, order = 2) {
  return [
    {
      operationName: "saveUserJobRoleV2",
      variables: {
        jobRoleUuid: jobRoleUuid,
        order: order,
      },
      query: `
                mutation saveUserJobRoleV2($jobRoleUuid: ID, $order: Int) {
                    skilzSaveUserJobRole(jobRoleUuid: $jobRoleUuid, order: $order)
                }
            `,
    },
  ];
}
