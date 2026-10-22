// Small search document + small variables — enough for HTTP 200 and title → UUID matching.
const SEARCH_MINIMAL_QUERY =
  "query search($query: String!, $source: String, $locale: String, $pagination: PaginationInput) {\n" +
  "  search(query: $query, source: $source, locale: $locale, pagination: $pagination) {\n" +
  "    results {\n" +
  "      title\n" +
  "      contentId: contentUuid\n" +
  "    }\n" +
  "    resultCount\n" +
  "  }\n" +
  "}\n";

export function postDataTopSearchedTermsBody(searchWord) {
  return [
    {
      operationName: "search",
      variables: searchVariables(searchWord, 20),
      query: SEARCH_MINIMAL_QUERY,
    },
  ];
}

/** Search payload for custom landing pages: resolve contentUuid by title. */
export function searchByTitleOnlyBody(searchWord) {
  return [
    {
      operationName: "search",
      variables: {
        query: searchWord,
        locale: "en-US",
        source: "WEB",
        pagination: { page: 0, perPage: 40 },
      },
      query:
        "query search($query: String!, $source: String, $locale: String, $pagination: PaginationInput) { search(query: $query, source: $source, locale: $locale, pagination: $pagination) { results { title description contentUuid url duration expertiseLevel } resultCount } }",
    },
  ];
}

function searchVariables(searchWord, perPage) {
  return {
    query: searchWord,
    locale: "en-IN",
    source: "WEB",
    pagination: { page: 0, perPage },
  };
}
