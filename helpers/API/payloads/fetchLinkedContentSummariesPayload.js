/**
 * Payload for fetching linked content summaries (paginated)
 * Used to get content UUIDs from child sites
 */
export function fetchLinkedContentSummariesPayload(
    offset = 0,
    max = 500,
    column = "modified_date",
    sort = "desc",
    includeDraft = true,
    includePublished = true,
    includeModified = true,
    includeRetired = true
) {
    return {
        contentItemTypes: ["COURSE", "LINKED_CONTENT"],
        locales: [],
        offset: offset,
        max: max,
        column: column,
        sort: sort,
        includeDraft: includeDraft,
        includePublished: includePublished,
        includeModified: includeModified,
        includeRetired: includeRetired,
        sources: [],
        authoringSystemRefs: [],
        modifiedDateFilter: null,
        startModifiedDate: null,
        endModifiedDate: null,
        createdByName: [],
        modifiedBy: [],
        hasBadges: null,
        visibleToLearners: null,
        storageUsageFilter: null,
        storageUsageStart: null,
        storageUsageEnd: null,
        linkedContentFormats: []
    };
}
