export function deleteDraftCuratorJobRolesPayload(jobRoleUuid) {
  return {
    operationName: "skilzDeleteCuratorJobRoles",
    variables: {
      jobRoleUuids: [jobRoleUuid],
    },
    query: `mutation skilzDeleteCuratorJobRoles($jobRoleUuids: [ID!]!) {
  skilzDeleteCuratorJobRoles(jobRoleUuids: $jobRoleUuids)
}`,
  };
}

export function deleteCuratorJobRolePayload(jobRoleUuid) {
  return {
    operationName: "skilzDeleteJobRole",
    variables: {
      jobRoleUuid,
    },
    query: `mutation skilzDeleteJobRole($jobRoleUuid: ID!) {
  skilzDeleteJobRole(jobRoleUuid: $jobRoleUuid)
}`,
  };
}
