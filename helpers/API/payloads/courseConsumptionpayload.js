import reusableFunctions from "../../UI/commonFunctions";
export function courseConsumptionPayLoad(courseUUID, videoUUID, content_type) {
  let randomUuid = reusableFunctions.uuidGenerator();
  return [
    {
      operationName: "contentLaunchEvent",
      variables: {
        contentContext: {
          uuid: videoUUID,
          type: "VIDEO",
          parentUuid: courseUUID,
        },
        eventContext: {
          action: "STARTED",
          viewParams: [
            {
              paramName: "COURSE_TOC",
              paramValue: courseUUID,
            },
          ],
          sessionId: randomUuid,
          instanceNumber: 1,
        },
      },
      query:
        "mutation contentLaunchEvent($contentContext: BFF_contentContext!, $eventContext: BFF_launchEventContext!) {\n  enrichmentLaunchEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
    {
      operationName: "contentLaunchEvent",
      variables: {
        contentContext: {
          uuid: courseUUID,
          type: content_type,// "COURSE"
        },
        eventContext: {
          action: "STARTED",
          viewParams: [
            {
              paramName: "searchUuid",
              paramValue: randomUuid,
            },
          ],
          sessionId: randomUuid,
          instanceNumber: 1,
        },
      },
      query:
        "mutation contentLaunchEvent($contentContext: BFF_contentContext!, $eventContext: BFF_launchEventContext!) {\n  enrichmentLaunchEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
  ];
}
