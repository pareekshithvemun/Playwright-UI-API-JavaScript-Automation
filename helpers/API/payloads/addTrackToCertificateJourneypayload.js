export function addTrackToCertificateJourneypayload(
  channelid,
  content,
  trackposition,
  trackName,
  trackDescription,
  trackImage,
  trackMileStone
) {
  return {
    channelUuid: channelid,
    displayTypeName: "TRACK",
    locale: "en-US",
    contentItems: content,
    resources: [],
    position: trackposition,
    title: trackName,
    description: `<p>${trackDescription}</p>`,
    imageUrl: trackImage,
    imageAltText: null,
    enableTrackBadging: false,
    resourcesToCreate: [],
    linkedContentToCreate: [],
    saveFileRequest: null,
    trackMilestone: trackMileStone,
  };
}
