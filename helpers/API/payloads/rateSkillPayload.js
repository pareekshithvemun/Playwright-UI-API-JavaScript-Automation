export function rateSkillPayload(skill_id, rating) {
  return [
    {
      operationName: "updateUserSkillRatings",
      variables: {
        input: [
          {
            skill_id: skill_id,
            rating: rating,
            disable_in_jobrole: false,
            is_other_skill: false,
          },
        ],
      },
      query:
        "mutation updateUserSkillRatings($input: [skilzUpsertUserSkillsInfoInput]!) {\n  skilzUpsertUserSkillsInfo(input: $input) {\n    status\n    message\n    __typename\n  }\n}\n",
    },
  ];
}
