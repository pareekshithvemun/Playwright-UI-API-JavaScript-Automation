// Career page search. Custom roles only. The old primaryJobRolesFromDB call is a different search.
export function searchCustomJobRolesPayload(roleName) {
  return [
    {
      operationName: "primaryJobRolesFromDBKg",
      variables: {
        input: {
          term: roleName,
          locale: "en-US",
          limit: 10,
          jobroleSourceFilter: "CUSTOM",
        },
      },
      query: `query primaryJobRolesFromDBKg($input: KGPrimaryJobRolesInput!) {
        kgPrimaryJobRoles(input: $input) {
          jobRoleName
          jobRoleUuid
          level
          classification
          jobFamilyId
          jobFamilyName
        }
      }`,
    },
  ];
}
