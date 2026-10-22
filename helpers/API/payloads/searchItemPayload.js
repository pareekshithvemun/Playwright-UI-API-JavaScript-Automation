import reusableFunctions from "../../UI/commonFunctions";

const SEARCH_ASSET_IN_ORG_QUERY =
  "query search($query: String!, $source: String, $locale: String, $ignoreCountryCode: Boolean, $countryCodes: [String], $includeEnglish: Boolean, $entitlement: [String], $sessionId: String, $includeContentNotInChannel: Boolean, $pagination: PaginationInput, $filters: FiltersInput, $viewParams: [ViewParamInput], $areaType: String, $searchMode: SearchModeEnum, $searchType: String, $jobRole: String, $isNew: Int, $organizationName: String, $searchVersion: SearchVersionEnum, $assignmentUuids: [String], $newContentOnly: Boolean, $localizedMetadata: Boolean) {\n  search(\n    query: $query\n    pagination: $pagination\n    locale: $locale\n    ignoreCountryCode: $ignoreCountryCode\n    countryCodes: $countryCodes\n    source: $source\n    entitlement: $entitlement\n    sessionId: $sessionId\n    searchVersion: $searchVersion\n    includeContentNotInChannel: $includeContentNotInChannel\n    filters: $filters\n    areaType: $areaType\n    viewParams: $viewParams\n    searchMode: $searchMode\n    jobRole: $jobRole\n    searchType: $searchType\n    includeEnglish: $includeEnglish\n    isNew: $isNew\n    organizationName: $organizationName\n    assignmentUuids: $assignmentUuids\n    newContentOnly: $newContentOnly\n    localizedMetadata: $localizedMetadata\n  ) {\n    results {\n      by\n      category\n      contentType\n      contentId: contentUuid\n      courseId: courseUuid\n      description\n      duration\n      expertiseLevel\n      expertiseLevels\n      imageUrl\n      imageAltText\n      modalities\n      providerContext\n      publishDate\n      bestChapterRef\n      bestChapterTitle\n      sourceName\n      technologyTitle\n      technologyVersion\n      title\n      complianceCourse\n      url\n      isNew\n      lastPublishDate\n      launchSource\n      containedInChannels {\n        channelId: channelUuid\n        title\n        category\n        __typename\n      }\n      form\n      languageCode\n      locale\n      minResolution\n      launchTarget\n      certificationExam\n      parent {\n        title\n        type\n        id: uuid\n        __typename\n      }\n      trackingMethod\n      launchAndTrack {\n        tracking\n        launchContext\n        ota\n        trackOnClose\n        partnerName\n        __typename\n      }\n      score\n      plannedRetirementDate\n      startDateAndTimeUtc\n      endDateAndTimeUtc\n      __typename\n    }\n    resultCount\n    searchId\n    __typename\n  }\n}\n";

/** GraphQL search by asset UUID (empty filters, searchVersion V2). */
export function searchAssetIdBody(assetId) {
  const sessionId = reusableFunctions.uuidGenerator();
  return [
    {
      operationName: "search",
      variables: {
        query: assetId.trim(),
        locale: "en-US",
        ignoreCountryCode: false,
        countryCodes: [],
        includeEnglish: false,
        source: "WEB",
        filters: {},
        pagination: {
          page: 0,
          perPage: 20,
        },
        sessionId,
        searchVersion: "V2",
        areaType: "CAREER_JOURNEYS",
        searchMode: "STANDARD",
        organizationName: null,
        isNew: 90,
        viewParams: [
          {
            paramName: "fromTypeahead",
            paramValue: "false",
          },
          {
            paramName: "fromRelatedSearch",
            paramValue: "false",
          },
        ],
        newContentOnly: false,
        localizedMetadata: true,
      },
      query: SEARCH_ASSET_IN_ORG_QUERY,
    },
  ];
}

export function searchItemBody(pagesize, content) {
  let uuid = reusableFunctions.uuidGenerator();
  return [
    {
      operationName: "search",
      variables: {
        query: content,
        locale: "en-US",
        ignoreCountryCode: false,
        source: "WEB",
        filters: {
          categoryFilter: "Skill%20Benchmark",
        },
        pagination: {
          page: 0,
          perPage: pagesize,
        },
        sessionId: uuid,
        sortBy: "SCORE",
        areaType: "CAREER_JOURNEYS",
        searchMode: "STANDARD",
        viewParams: [
          {
            paramName: "fromTypeahead",
            paramValue: "false",
          },
        ],
      },
      query:
        "query search($query: String!, $source: String, $locale: String, $ignoreCountryCode: Boolean, $entitlement: [String], $sessionId: String, $includeContentNotInChannel: Boolean, $pagination: PaginationInput, $filters: FiltersInput, $sortBy: SortByEnum, $viewParams: [ViewParamInput], $areaType: String, $searchMode: SearchModeEnum, $jobRole: String) {\n  search(\n    query: $query\n    pagination: $pagination\n    locale: $locale\n    ignoreCountryCode: $ignoreCountryCode\n    source: $source\n    entitlement: $entitlement\n    sessionId: $sessionId\n    includeContentNotInChannel: $includeContentNotInChannel\n    filters: $filters\n    sortBy: $sortBy\n    areaType: $areaType\n    viewParams: $viewParams\n    searchMode: $searchMode\n    jobRole: $jobRole\n  ) {\n    results {\n      by\n      category\n      contentType\n      contentId: contentUuid\n      courseId: courseUuid\n      description\n      duration\n      expertiseLevel\n      expertiseLevels\n      imageUrl\n      imageAltText\n      modalities\n      providerContext\n      publishDate\n      bestChapterRef\n      bestChapterTitle\n      sourceName\n      technologyTitle\n      technologyVersion\n      title\n      complianceCourse\n      url\n      launchSource\n      containedInChannels {\n        channelId: channelUuid\n        title\n        category\n        __typename\n      }\n      form\n      languageCode\n      locale\n      minResolution\n      launchTarget\n      certificationExam\n      parent {\n        title\n        type\n        id: uuid\n        __typename\n      }\n      trackingMethod\n      launchAndTrack {\n        tracking\n        launchContext\n        ota\n        trackOnClose\n        partnerName\n        __typename\n      }\n      score\n      areaSubject {\n        ownerUuid\n        areaType\n        areaUuid\n        title\n        __typename\n      }\n      plannedRetirementDate\n      startDateAndTimeUtc\n      endDateAndTimeUtc\n      __typename\n    }\n    resultCount\n    availableFilters {\n      modalities {\n        read\n        watch\n        listen\n        practice\n        __typename\n      }\n      categoryCounts {\n        categoryName: category\n        categoryCount: count\n        __typename\n      }\n      credentialCounts {\n        credentialName: credential\n        credentialCount: count\n        __typename\n      }\n      expertiseLevelCounts {\n        count\n        expertiseLevel\n        __typename\n      }\n      durationRangesCounts {\n        range\n        count\n        __typename\n      }\n      sourceCounts {\n        source\n        count\n        __typename\n      }\n      subjectCounts {\n        subjectTitle\n        count\n        __typename\n      }\n      subtitlesCounts {\n        subtitle\n        count\n        __typename\n      }\n      languagesCounts {\n        locale\n        count\n        __typename\n      }\n      ratingsCounts {\n        starRating\n        count\n        __typename\n      }\n      __typename\n    }\n    searchId\n    __typename\n  }\n}\n",
    },
  ];
}
