export function certificationPathPayload(
    uuid,
    journeyName,
    journeyDescription,
    journeyImage,
    proofOfCertification,
    isSimple = true // Default to SIMPLE, can be changed
  ) {
    let journeyType = isSimple ? "SIMPLE" : "CLASSIC";
  
    return {
      channelUuid: uuid,
      imageUrl: journeyImage,
      modifiedCounter: 0,
      saveFileRequest: null,
      saveLogoFileRequest: null,
      typeName: "JOURNEY",
      displayTypeName: "JOURNEY",
      localizedMetadata: [
        {
          locale: "en-US",
          title: journeyName,
          description: `<p class="EditorTheme__paragraph"><span>${journeyDescription}</span></p>`,
          examLevel: "",
          examFormat: "",
          imageAltText: "Custom channel",
        },
      ],
      newLocales: [],
      sourceName: "SkillSoft",
      category: "Certification Path", //  "category": "Journey",
      enableJourneyBadging: false,
      enableTrackBadging: false,
      journeyStyle: journeyType,
      requiredCompletionType: "NONE",
      removeEnglishFirst: true,
      subtypeName: "CERTIFICATION_PATH",
      examNumber: "",
      proofOfCertificationNeeded: proofOfCertification,
      certificationLogoUrl: null,
      certificationLogoDisplayName: null,
      certificationLogoName: null,
      skills: [],
      completionCertificateEnabled: true,
      initialConfig: journeyType,
    };
  }
  