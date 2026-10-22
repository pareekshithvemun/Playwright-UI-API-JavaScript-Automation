export function addIntroPayload(
  channelid,
  content,
  trackposition,
  trackName,
  trackImage,
  badgeID
) {
  return {
    channelUuid: channelid,
    displayTypeName: "VIEW",
    locale: "en-US",
    contentItems: content,
    position: trackposition,
    title: trackName,
    imageUrl: trackImage,
    enableTrackBadging: false,
    resourcesToCreate: [],
    linkedContentToCreate: [],
    saveFileRequest: null,
    badgeDesignUuid: badgeID,
  };
}
