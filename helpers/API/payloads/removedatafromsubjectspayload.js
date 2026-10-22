import reusableFunctions from "../../UI/commonFunctions";

export function changeSubjContent(areaUuid) {
    let randomString=reusableFunctions.generateRandomString(5);
    return {
        "title": randomString,
        "areaUuid":areaUuid,
        "imageUrl": "https://cdn2.percipio.com/public/c/public/images/customSubject.jpg",
        "subjectType": "standard",
        "localizedMetadataList": [
            {
                "title": randomString,
                "description": "",
                "languageId": 1,
                "imageAltText": "Custom Area"
            }
        ],
        "includedInInterests": true,
        "channelUuids": []
    };
  }
  