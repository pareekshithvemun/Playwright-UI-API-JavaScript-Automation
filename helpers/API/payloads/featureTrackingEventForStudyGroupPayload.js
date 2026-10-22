export function featureTrackingEventForStudyGroupPayload() {
  return [
    {
      "operationName": "featureTrackingEvent",
      "variables": {
        "eventContext": {
          "featureUuid": "6cbcf29a-a469-4cb4-ab06-afe1844f2b3e",
          "featureMetrics": [
            {
              "metricName": "studyGroupCreated",
              "metricFeatureType": "count",
              "metricDataType": "integer",
              "metricValue": "1"
            }
          ]
        }
      },
      "query": "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n"
    },
    {
      "operationName": "featureTrackingEvent",
      "variables": {
        "eventContext": {
          "featureUuid": "6cbcf29a-a469-4cb4-ab06-afe1844f2b3e",
          "featureMetrics": [
            {
              "metricName": "studyGroupAccepted",
              "metricFeatureType": "count",
              "metricDataType": "integer",
              "metricValue": "1"
            }
          ]
        }
      },
      "query": "mutation featureTrackingEvent($eventContext: BFF_JSON) {\n  featureTrackingEvent(eventContext: $eventContext) {\n    success\n    validation\n    __typename\n  }\n}\n"
    }
  ];
}
