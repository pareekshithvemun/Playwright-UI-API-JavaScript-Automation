/**
 * Payload for fetching custom content (Journey/Channel) by name
 * Uses channels/fetch-paginated endpoint
 * Only fetches published content (status 2)
 */
export function fetchCustomContentByNamePayload(name, apiType) {
  return {
    type: apiType,
    sort: "desc",
    column: "modified_date",
    term: name,
    locale: "en-US",
    createdBy: [],
    offset: 0,
    max: 100,
    includeDraft: false,
    includeModified: false,
    includeRetired: false,
    includePublished: true,
    journeyStyles: null,
    titleTerm: "",
    titleFilter: null,
    modifiedDateFilter: null,
    startModifiedDate: null,
    endModifiedDate: null,
    modifiedBy: [],
  };
}
