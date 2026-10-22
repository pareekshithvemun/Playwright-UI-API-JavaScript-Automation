export function createLinkedContentPayload(title, url, description, imageUrl, modality, duration, skills = [], sourceName = "Skillsoft") {
    return {
        "linkedContentType": "EXTERNAL_LINK",
        "title": title,
        "locale": "en-US",
        "url": url,
        "modality": modality,
        "trackingMethod": "LAUNCH", //SELF_REPORTED or LAUNCH
        "description": `<p>${description}</p>`,
        "imageUrl": imageUrl,
        "closedCaptionsFilePath": null,
        "durationInSeconds": duration,
        "category": "Link",
        "expertiseLevel": "EVERYONE",
        "modifiedCounter": 0,
        "sourceName": sourceName,
        "providerName": "STANDARD",
        "curationPermission": "CUSTOM",
        "minResolution": "320",
        "timeZone": "Asia/Calcutta",
        "enableCustomCourseBadging": false,
        "imageAltText": "Custom content",
        "badgeCustomTitle": title,
        "skills": skills,
        "syncCompletionData": true,
        "audience": {},
        "learningObjectives": [],
        "saveFileRequest": null
    }
}
