export function lxAssessmentSkillsPayload(text) {
  return {
    operationName: "FetchSearchOrgSkills",
    variables: {
      text: text
    },
    query: "query FetchSearchOrgSkills($text: String!) {\n  skilzSearchOrgSkills(text: $text, locale: \"en-US\", limit: 20) {\n    id\n    name\n    __typename\n  }\n}"
  };
}
