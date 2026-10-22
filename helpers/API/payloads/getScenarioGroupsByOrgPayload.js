export function getScenarioGroupsByOrgPayload(orgId, includeStock) {
  return {
    operationName: "getScenarioGroupsByOrg",
    variables: {
      orgId: orgId,
      includeStock: includeStock,
    },
    query: `query getScenarioGroupsByOrg($orgId: ID!, $includeStock: Boolean!) {
  getScenarioGroupsByOrg(orgId: $orgId, includeStock: $includeStock) {
    id
    name
    __typename
  }
}`,
  };
}
