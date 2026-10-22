export function dynamicContentPayload(assedId,dynamicContentTitle,dynamicContentDescription,imageUrl,subjectUuidArray) {
    return {
        newAssetId:assedId ,
        subjectUuids: subjectUuidArray,
        imageUrl: imageUrl,
        modifiedCounter: 0,
        typeName: "VIRTUAL",
        displayTypeName: "VIRTUAL",
        localizedMetadata: [
            {
                locale: "en-US",
                title: dynamicContentTitle,
                description: `<p>${dynamicContentDescription}</p>`
            }
        ],
        newLocales: [],
        sourceName: "SkillSoft",
        category: "Dynamic Content",
        subtypeName: "USER_TAILORED_CONTENT",
        initialConfig: "VIRTUAL",
        saveFileRequest: null,
        removeEnglishFirst: false
    }

}
   
    
   
