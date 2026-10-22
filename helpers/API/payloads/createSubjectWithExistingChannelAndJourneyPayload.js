export async function createSubjectWithExistingChannelAndJourneyBody(
  subjectName,
  subjContent,
  areaUUID,
  description,
  subImage
) {
  return {
    title: subjectName,
    description: description,
    areaUuid: areaUUID,
    imageUrl: subImage,
    subjectType: "standard",
    localizedMetadataList: [
      {
        title: subjectName,
        description: description,
        languageId: 1,
      },
    ],
    includedInInterests: true,
    channelUuids: subjContent,
  };
}
