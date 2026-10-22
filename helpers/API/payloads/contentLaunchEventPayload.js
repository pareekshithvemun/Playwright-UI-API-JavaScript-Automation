export function contentLaunchEvent(benchMrkId,randomuuid1,randomuuid2){
    return [
        {
            "operationName": "contentLaunchEvent",
            "variables": {
                "contentContext": {
                    "uuid": benchMrkId,
                    "type": "ASSESSMENT"
                },
                "eventContext": {
                    "action": "STARTED",
                    "viewParams": [
                        {
                            "paramName": "CHALLENGEID",
                            "paramValue": randomuuid1
                        }
                    ],
                    "sessionId": randomuuid2
                }
            },
            "query": "mutation contentLaunchEvent($contentContext: BFF_contentContext!, $eventContext: BFF_launchEventContext!) {\n  enrichmentLaunchEvent(\n    contentContext: $contentContext\n    eventContext: $eventContext\n  ) {\n    success\n    validation\n    __typename\n  }\n}\n"
        }
    ]
}