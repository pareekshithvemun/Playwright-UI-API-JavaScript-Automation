// One focus skill, one click. A rating of 0 is not sent.
export function rateFocusSkillKgPayload(skillId, rating) {
  return [
    {
      operationName: "updateUserKGSkillRatings",
      variables: {
        input: [
          {
            kg_skill_id: skillId,
            rating,
            disable_in_jobrole: false,
            is_other_skill: false,
          },
        ],
      },
      query: `mutation updateUserKGSkillRatings($input: [skilzUpsertUserKGSkillsInfoInput]!) {
        skilzUpsertUserKGSkillsInfo(input: $input) {
          status
          message
        }
      }`,
    },
  ];
}
