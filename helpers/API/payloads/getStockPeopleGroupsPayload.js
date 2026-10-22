export function getStockPeopleGroupsPayload(locale = "en-US") {
  return {
    operationName: "getStockPeopleGroups",
    variables: { locale },
    query: `query getStockPeopleGroups($locale: String) {
  getStockPeopleGroups(locale: $locale) {
    uuid
    name
    description
    persons {
      avatarId
      type
      avatar
      person {
        voice
        uuid
        role
        obstacles
        objectives
        name
        description
        __typename
      }
      __typename
    }
    __typename
  }
}`,
  };
}
