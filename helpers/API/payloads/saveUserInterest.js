export function saveUserInterestBody(interestArray) {
  return [
    {
      operationName: "saveInterests",
      variables: {
        uuids: interestArray,
      },
      query:
        "mutation saveInterests($uuids: [ID!]!) {\n  interests(interests: $uuids)\n}\n",
    },
  ];
}
