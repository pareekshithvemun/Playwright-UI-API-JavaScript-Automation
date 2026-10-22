export function addtrack(
  channelid,
  content,
  trackposition,
  trackName,
  trackDescription,
  trackImage,
  badgeID,
  enableBadging = true
) {
  const payload = {
    channelUuid: channelid,
    displayTypeName: "TRACK",
    languageCode: "en",
    locale: "en-US",
    contentItems: content,
    resources: [],
    position: trackposition,
    title: trackName,
    description: `<p>${trackDescription}</p>`,
    imageUrl: trackImage,
    imageAltText: null,
    enableTrackBadging: enableBadging,
    resourcesToCreate: [],
    resourcesToUpdate: [],
    linkedContentToCreate: [],
    linkedContentToUpdate: [],
    saveFileRequest: null,
    trackMilestone:  "LEARNING" 
  };
  if (enableBadging) {
    payload.badgeDesignUuid = badgeID;
  }
  return payload;
}
