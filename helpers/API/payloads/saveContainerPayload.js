export function saveContainerPayload(orgId, adminId, assedId,dynamicContentTitle,dynamicContentDescription,dynamicContentInstruction,imageUrl) {
    return {
        "orgId": orgId,
        "adminId": adminId,
        "definition": [
            {
                "locale": "en-US",
                "definition": {
                    "image": imageUrl,
                    "title": dynamicContentTitle,
                    "description": `<p>${dynamicContentDescription}</p>`,
                    "instructions": `<p>${dynamicContentInstruction}</p>`,
                    "contentSource": "SkillSoft"
                }
            }
        ],
        "fallbackLanguage": "en-US",
        "containerType": "CONTAINER",
        "assetId": assedId,
        "stagedPhotoData": {}
    }
}