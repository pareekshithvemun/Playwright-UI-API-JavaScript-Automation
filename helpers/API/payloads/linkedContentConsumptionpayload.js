import reusableFunctions from "../../UI/commonFunctions";
export function linkedContentConsumptioBody(contentUUID, content_type) {
  let uuid = reusableFunctions.uuidGenerator();
  return [
    {
      operationName: "contentLaunchEvent",
      variables: {
        contentContext: {
          uuid: contentUUID,
          type: content_type,
        },
        eventContext: {
          action: "LAUNCHED",
          sessionId: uuid,
          viewParams: [
            {
              paramName: "searchUuid",
              paramValue: uuid,
            },
          ],
          fromWithinView: "SEARCH",
          applicationType: "PERCIPIO_WEB",
          deviceType: "DESKTOP",
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          instanceNumber: 1,
        },
      },
      query:
        "mutation contentLaunchEvent($contentContext: BFF_contentContext!, $eventContext: BFF_launchEventContext!) {\n  enrichmentLaunchEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
    {
      operationName: "contentConsumption",
      variables: {
        contentContext: {
          uuid: contentUUID,
          type: content_type,
        },
        eventContext: {
          action: "COMPLETE",
          sessionId: uuid,
          instanceNumber: 1,
        },
      },
      query:
        "mutation contentConsumption($contentContext: BFF_contentContext!, $eventContext: BFF_eventContext!) {\n  enrichmentConsumptionEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
  ];
}
