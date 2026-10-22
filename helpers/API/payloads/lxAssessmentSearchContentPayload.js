export function lxAssessmentSearchContentPayload(query, locale = "en-US") {
  return {
    operationName: "ExampleQuery",
    variables: {
      query: query,
      includeEnglish: true,
      source: "LX_STUDIO",
      locale: locale,
      pagination: {
        page: 0,
        perPage: 10,
      },
      filters: {
        typeFilter: "VIDEO,LINKED_CONTENT,COURSE,CHANNEL,JOURNEY",
      },
    },
    query: `query ExampleQuery($query: String!, $includeEnglish: Boolean, $source: String, $locale: String, $filters: FiltersInput, $pagination: PaginationInput) {
  search(
    query: $query
    includeEnglish: $includeEnglish
    source: $source
    locale: $locale
    filters: $filters
    pagination: $pagination
  ) {
    availableFilters {
      categories
      __typename
    }
    resultCount
    results {
      duration
      contentUuid
      contentType
      imageUrl
      languageCode
      locale
      ownerUuid
      description
      courseUuid
      expertiseLevel
      expertiseLevels
      title
      __typename
    }
    __typename
  }
}`,
  };
}
