import reusableFunctions from "../../UI/commonFunctions";
export function bookSummaryConsumptioPayLoad(contentUUID, content_type) {
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
          startPos: "epubcfi(/6/8!/4/2[epubmain]/2[N458]/4/2/2/10/4/2/1:21)",
          endPos: "epubcfi(/6/8!/4/2[epubmain]/2[N458]/4/2/2/10/6/2/1:356)",
          sectionKey: "page-2.xhtml",
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
