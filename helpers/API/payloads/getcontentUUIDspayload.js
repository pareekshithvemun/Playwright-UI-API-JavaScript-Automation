export function getContentUUIdpayload(orgid, adminUserId, contentsize) {
  return [
    {
      operationName: "dwAllContentListingRows",
      variables: {
        startRow: 0,
        endRow: contentsize,
        rowGroupCols: [],
        valueCols: [],
        pivotCols: [],
        pivotMode: false,
        groupKeys: [],
        filterModel: {},
        sortModel: [],
        variables: {
          userLocale: "en-US",
          template: "All Content Listing",
          addedToPercipio: "all time",
          locale: "en-US",
          contentStatus: "Published",
          query: {
            addedToPercipio: "all time",
            contentStatus: "Published:Published",
            localeLabel: "English (US)",
            localeKey: "en-US",
          },
          orgId: orgid,
          userId: adminUserId,
          filterSummary: [
            {
              filterName: "addedToPercipio",
              filterValues: ["all time"],
              filterDisplay: ["all time"],
            },
            {
              filterName: "locale",
              filterValues: ["en-US"],
              filterDisplay: ["English (US)"],
            },
            {
              filterName: "contentStatus",
              filterValues: ["Published"],
              filterDisplay: ["Published"],
            },
          ],
        },
      },
      query:
        "query dwAllContentListingRows($startRow: Int, $endRow: Int, $rowGroupCols: [dwColumnVO], $valueCols: [dwColumnVO], $pivotCols: [dwColumnVO], $pivotMode: Boolean, $groupKeys: [String], $filterModel: JSON, $sortModel: JSON, $variables: JSON) {\n  dwAllContentListingRows(\n    startRow: $startRow\n    endRow: $endRow\n    rowGroupCols: $rowGroupCols\n    valueCols: $valueCols\n    pivotCols: $pivotCols\n    pivotMode: $pivotMode\n    groupKeys: $groupKeys\n    filterModel: $filterModel\n    sortModel: $sortModel\n    variables: $variables\n  ) {\n    collection_name\n    primary_subject_title\n    secondary_subject_title\n    channel_title\n    journey_title\n    assignment_title\n    promotion_title\n    channel_or_journey_description\n    container_type\n    content_title\n    asset_type\n    content_type\n    avg_asset_ratings\n    provider_name\n    publisher_name\n    source_name\n    locale\n    pdu_credits\n    cpe_credits\n    badge_eligible\n    asset_status\n    keyword_name\n    technology_title\n    technology_version\n    expertise_name\n    first_publish_date\n    last_publish_date\n    estimated_duration_seconds\n    estimated_duration_seconds_hours\n    estimated_duration_seconds_hhmmss\n    asset_uuid\n    content_id\n    external_id\n    channel_uuid\n    description\n    external_link\n    planned_retirement_date\n    retired_date\n    replacement_content_uuid\n    replacement_titles\n    replacement_content_coming\n    retirement_reason\n    in_assessment\n    wcag\n    content_owner\n    copyright_year\n    transcripts\n    captions\n    audio_available\n    english_equivalent_course_uuid\n    english_equivalent_titles\n    english_equivalent_course_code\n    total_rowcount\n    grouping_rowcount\n    __typename\n  }\n}\n",
    },
  ];
}
