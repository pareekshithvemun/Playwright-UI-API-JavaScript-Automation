/**
 * Payload for fetchLibraries GraphQL query (library → areas → subjects).
 * Used to get area and subject UUIDs for channel creation.
 */
const FETCH_LIBRARIES_QUERY = `query fetchLibraries($locale: String!) {
  libraries(locale: $locale) {
    id: uuid
    title: name
    locale
    index
    displayName
    subjects: children {
      id: uuid
      title: name
      locale
      type
      index
      imageUrl
      imageAltText: altText
      attributes {
        attributeKey
        attributeValue
        __typename
      }
      subjects: children {
        id: uuid
        title: name
        locale
        index
        type
        imageUrl
        imageAltText: altText
        __typename
      }
      __typename
    }
    __typename
  }
}
`;

export function getFetchLibrariesPayload(locale = "en-US") {
  return [
    {
      operationName: "fetchLibraries",
      variables: { locale },
      query: FETCH_LIBRARIES_QUERY,
    },
  ];
}
