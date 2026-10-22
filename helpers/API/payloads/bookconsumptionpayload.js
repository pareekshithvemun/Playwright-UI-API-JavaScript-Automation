import reusableFunctions from "../../UI/commonFunctions";
export function bookConsumptioPayLoad(contentUUID, content_type) {
    let uuid = reusableFunctions.uuidGenerator();
  return [
    {
      operationName: "contentConsumption",
      variables: {
        eventContext: {
          action: "CONSUMED",
          sessionDurationSeconds: 1,
          sessionId: uuid,
          positionType: "CFI",
          startPos:
            "epubcfi(/6/4!/4/2[epubmain]/2[g00afbd8b-3c06-4dc5-bc13-ed35e98d423e]/2/2/1:0)",
          endPos:
            "epubcfi(/6/4!/4/2[epubmain]/2[g00afbd8b-3c06-4dc5-bc13-ed35e98d423e]/4/2/1:9)",
          sectionKey: "book-0.xhtml",
          sectionChangeCount: 1,
          instanceNumber: 1,
        },
        contentContext: {
          uuid: contentUUID,
          type: content_type,
        },
      },
      query:
        "mutation contentConsumption($contentContext: BFF_contentContext!, $eventContext: BFF_eventContext!) {\n  enrichmentConsumptionEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
  ];
}
