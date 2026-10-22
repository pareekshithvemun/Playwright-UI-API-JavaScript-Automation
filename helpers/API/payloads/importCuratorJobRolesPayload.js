// The sheet says "Executive". The import call needs the number that word maps to.
export function roleClassificationsPayload() {
  return {
    operationName: "KgGetRoleClassifications",
    variables: { locale: "en-US" },
    query: `query KgGetRoleClassifications($locale: String) {
  kgGetRoleClassifications(locale: $locale) {
    name
    number
  }
}`,
  };
}

// One call can send every role. A matching name keeps the old id. A new name gets a new id.
export function importCuratorJobRolesPayload(jobRoles) {
  return {
    operationName: "skilzImportJobRoles",
    variables: {
      jobroles: jobRoles,
      enableUseKGAPI: true,
    },
    query: `mutation skilzImportJobRoles($jobroles: [skilzUpsertCuratorJobRoleImportInput]!, $enableUseKGAPI: Boolean) {
  skilzImportJobRoles(jobroles: $jobroles, enableUseKGAPI: $enableUseKGAPI)
}`,
  };
}

export function publishCuratorJobRolesPayload(jobRoleIds) {
  return {
    operationName: "skilzPublishJobRolesSet",
    variables: { jobRoleIds },
    query: `mutation skilzPublishJobRolesSet($jobRoleIds: [ID!]!) {
  skilzPublishJobRolesSet(jobRoleIds: $jobRoleIds)
}`,
  };
}
