export function addUserProfilePayload(url) {
  return [
    {
      operationName: "updateProfileImage",
      variables: {
        profileImageUrl:url,
      },
      query:
        "mutation updateProfileImage($profileImageUrl: String!) {\n  updateProfileImage(profileImageUrl: $profileImageUrl) {\n    status\n    invalidFields {\n      code\n      message\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
  ];
}
