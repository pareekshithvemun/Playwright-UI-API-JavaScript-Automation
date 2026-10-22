export function getChannelsBody(){
    return {
        "offset": 0,
        "max": 200,
        "sort": "desc",
        "column": "modified_date",
        "includeDraft": true,
        "includeModified": true,
        "includePublished": true,
        "includeRetired": true,
        "term": "",
        "showMyChannels": false,
        "createdBy": []
    };
}