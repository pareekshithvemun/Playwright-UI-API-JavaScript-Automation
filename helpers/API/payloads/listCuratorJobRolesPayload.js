// Custom roles only. Offset stays 0 in the script because deleted roles drop off the front of the list.
export function listCuratorJobRolesPayload(limit, offset, includeUnPublishedOnly = false, source = "custom") {
  return {
    operationName: "listCuratorJobRoles",
    variables: {
      locale: "en-US",
      term: "",
      exactMatch: false,
      source,
      includeUnPublishedOnly,
      limit,
      offset,
      enableUseKGAPI: true,
    },
    query: `query listCuratorJobRoles($locale: String, $term: String, $exactMatch: Boolean, $includeUnPublishedOnly: Boolean, $source: filterSource, $limit: Int, $offset: Int, $enableUseKGAPI: Boolean) {
  skilzListCuratorJobRoles(
    locale: $locale
    term: $term
    exactMatch: $exactMatch
    includeUnPublishedOnly: $includeUnPublishedOnly
    source: $source
    limit: $limit
    offset: $offset
    enableUseKGAPI: $enableUseKGAPI
  ) {
    id
    name
    state
    __typename
  }
}`,
  };
}
