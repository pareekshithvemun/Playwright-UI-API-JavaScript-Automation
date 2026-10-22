export function featureTrackingEventForPlaylistPayload() {
  return [
    {
      operationName: "featureTrackingEvent",
      variables: {
        eventContext: {
          featureUuid: "64c8ae9a-2281-4c8d-b0e7-a2ed3e605cb1",
          featureMetrics: [
            {
              metricName: "assetsLaunched",
              metricFeatureType: "count",
              metricDataType: "integer",
              metricValue: "1",
            },
          ],
        },
      },
      query:
        "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
    {
      operationName: "featureTrackingEvent",
      variables: {
        eventContext: {
          featureUuid: "64c8ae9a-2281-4c8d-b0e7-a2ed3e605cb1",
          featureMetrics: [
            {
              metricName: "playListCreated",
              metricFeatureType: "count",
              metricDataType: "integer",
              metricValue: "1",
            },
          ],
        },
      },
      query:
        "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
    {
      operationName: "featureTrackingEvent",
      variables: {
        eventContext: {
          featureUuid: "64c8ae9a-2281-4c8d-b0e7-a2ed3e605cb1",
          featureMetrics: [
            {
              metricName: "playListDeleted",
              metricFeatureType: "count",
              metricDataType: "integer",
              metricValue: "1",
            },
          ],
        },
      },
      query:
        "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
    {
      operationName: "featureTrackingEvent",
      variables: {
        eventContext: {
          featureUuid: "64c8ae9a-2281-4c8d-b0e7-a2ed3e605cb1",
          featureMetrics: [
            {
              metricName: "assetsRemoved",
              metricFeatureType: "count",
              metricDataType: "integer",
              metricValue: "1",
            },
          ],
        },
      },
      query:
        "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
    {
      operationName: "featureTrackingEvent",
      variables: {
        eventContext: {
          featureUuid: "64c8ae9a-2281-4c8d-b0e7-a2ed3e605cb1",
          featureMetrics: [
            {
              metricName: "assetsAdded",
              metricFeatureType: "count",
              metricDataType: "integer",
              metricValue: "1",
            },
          ],
        },
      },
      query:
        "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n",
    },
  ];
}
