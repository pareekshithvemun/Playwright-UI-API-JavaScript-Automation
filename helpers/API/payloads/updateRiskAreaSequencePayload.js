export function updateRiskAreaSequencePayload(
  orgUUID,
  orgRiskAreasSeq,
  locale = "en-US",
) {
  return [
    {
      operationName: "UpdateRiskAreaSequence",
      variables: {
        orgUUID,
        locale,
        orgRiskAreasSeq,
      },
      query:
        "mutation UpdateRiskAreaSequence($orgUUID: String!, $locale: String!, $orgRiskAreasSeq: [RiskAreaSeqInput!]!) {\n  updateRiskAreaSequence(\n    input: {orgUUID: $orgUUID, locale: $locale, riskAreaSeq: $orgRiskAreasSeq}\n  ) {\n    id\n    orgUUID\n    riskAreaUUID\n    title\n    description\n    sequence\n    isActive\n    __typename\n  }\n}\n",
    },
  ];
}
