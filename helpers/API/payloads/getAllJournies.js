export function getAllJournies() {
  return {
    type: "JOURNEY",
    max: 900,
    offset: 0,
    sort: "desc",
    column: "modified_date",
    term: "",
    includeDraft: true,
    includePublished: true,
    includeModified: true,
    includeRetired: true,
    createdBy: [],
    locale: "en-US",
  };
}

export function getJourneyByName(journeyName) {
  return {
    type: "JOURNEY",
    max: 50,
    offset: 0,
    sort: "desc",
    column: "modified_date",
    term: journeyName,
    includeDraft: true,
    includePublished: true,
    includeModified: true,
    includeRetired: true,
    createdBy: [],
    locale: "en-US",
  };
}
