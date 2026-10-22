export function getAudienceUsersPayload(audienceId) {
  return {
    q: "",
    max: 5000,
    offset: 0,
    sort: "lastName,firstName,email,externalId",
    audienceUuid: audienceId,
    status: "Active",
  };
}
