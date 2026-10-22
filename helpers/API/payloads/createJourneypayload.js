export function createcustomJourney(
  uuid,
  journeyName,
  subUUID,
  journeyDescription,
  journeyImage,
  skills = [],
  journeyStyle = "CLASSIC",
  enableBadging = true
) {
  return {
    channelUuid: uuid,
    subjectUuids: Array.isArray(subUUID) ? subUUID : [subUUID],
    imageUrl: journeyImage,
    modifiedCounter: 0,
    saveFileRequest: null,
    saveLogoFileRequest: null,
    typeName: "JOURNEY",
    displayTypeName: "JOURNEY",
    localizedMetadata: [
      {
        languageCode: "en",
        title: journeyName,
        description: `<p>${journeyDescription}</p>`,
        locale: "en-US",
        imageAltText: "Custom Journey",
        examFormat: null,
        examLevel: null
      },
    ],
    newLocales: [],
    sourceName: "Skillsoft",
    category: "Journey",
    enableJourneyBadging: enableBadging,
    enableTrackBadging: enableBadging,
    journeyStyle: journeyStyle,
    requiredCompletionType: "NONE",
    removeEnglishFirst: true,
    subtypeName: "CUSTOM_JOURNEY",
    examNumber: null,
    proofOfCertificationNeeded: false,
    certificationLogoUrl: null,
    certificationLogoDisplayName: null,
    certificationLogoName: null,
    skills: skills,
    completionCertificateEnabled: true,
    aiGenerated: false,
    initialConfig: journeyStyle
  };
}
