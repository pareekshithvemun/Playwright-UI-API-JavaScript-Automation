import reusableFunctions from "../../UI/commonFunctions";
export function videoConsumptionPayLoad(
  courseUUID,
  videoUUID,
  content_type
) {
  let uuid = reusableFunctions.uuidGenerator();
  return [
    {
      operationName: "contentConsumption",
      variables: {
        contentContext: {
          uuid: videoUUID,
          parentUuid: courseUUID,
          type: content_type,
        },
        eventContext: {
          action: "CONSUMED",
          sessionId: uuid,
          playbackMultiplier: 1,
          sessionDurationSeconds: 9,
          startPos: "0",
          endPos: "3",
          positionType: "SECONDS",
          instanceNumber: 1,
        },
        sessionId: uuid,
      },
      query:
        "mutation contentConsumption($contentContext: BFF_contentContext!, $eventContext: BFF_eventContext!) {\n  enrichmentConsumptionEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
  ];
}
