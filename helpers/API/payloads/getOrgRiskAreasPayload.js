export function getOrgRiskAreasPayload(orgUUID, locale = "en-US") {
  return [
    {
      operationName: "getOrgRiskAreas",
      variables: {
        orgUUID,
        locale,
      },
      query:
        "query getOrgRiskAreas($orgUUID: String!, $locale: String!) {\n  orgRiskAreas(orgUUID: $orgUUID, locale: $locale) {\n    id\n    orgUUID\n    riskAreaUUID\n    title\n    description\n    sequence\n    isActive\n    __typename\n  }\n}\n",
    },
  ];
}
