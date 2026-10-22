export function getStockPeoplePayload(conversationId, locale = "en-US") {
  return {
    operationName: "getPeople",
    variables: { conversationId, locale },
    query: `query getPeople($conversationId: ID, $locale: String) {
  getPeople(conversationId: $conversationId, locale: $locale) {
    person {
      uuid
      name
      role
      description
      obstacles
      objectives
      voice
      __typename
    }
    avatar
    avatarId
    type
    __typename
  }
}`,
  };
}
