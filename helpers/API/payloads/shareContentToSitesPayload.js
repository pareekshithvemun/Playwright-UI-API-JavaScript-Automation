// PUT body: sharedTo is the full list. Any child left out loses the share.
export function shareContentToSitesPayload(
  createdBy,
  sharedFrom,
  contentItemUuid,
  sharedToArray
) {
  return {
    createdBy: createdBy,
    sharedFrom: sharedFrom,
    contentItemTypeName: "LINKED_CONTENT",
    contentItemUuid: contentItemUuid,
    sharedTo: sharedToArray,
  };
}
