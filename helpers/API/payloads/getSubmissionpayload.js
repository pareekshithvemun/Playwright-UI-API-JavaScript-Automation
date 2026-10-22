export function getSumbissionPayload(uuId,assessmentId,questionuuid,challengeUuid){
let payload;
payload = [
    {
        "operationName": "getSubmission",
        "variables": {
            "uuid": `${uuId}`
        },
        "query": "query getSubmission($uuid: ID!) {\n  submission(challengeQuestionId: $uuid) {\n    answerCount\n    assessmentsChallengeQuestionUuid\n    correctCount\n    maxCorrect\n    score\n    id: uuid\n    correctedChoices {\n      choiceUuid\n      isUserCorrect\n      solution\n      userAnswer\n      __typename\n    }\n    __typename\n  }\n}\n"
    },
    {
        "operationName": "knowledgeCheckConsumption",
        "variables": {
            "uuids": [
                `${assessmentId}`
            ]
        },
        "query": "query knowledgeCheckConsumption($uuids: [ID!]) {\n  completedChallenges(uuids: $uuids) {\n    id: uuid\n    __typename\n  }\n  startedChallenges(uuids: $uuids) {\n    id: uuid\n    __typename\n  }\n}\n"
    },
    {
        "operationName": "reportAssessmentDuration",
        "variables": {
            "questionId": `${questionuuid}`,
            "questionNumber": 2,
            "startTs": currentDate.toISOString(),
            "eventType": "ANSWERED",
            "challengeId": `${challengeUuid}`,
            "assessmentId": `${assessmentId}`,
            "numberOfQuestions": 25,
            "endTs": currentDate.toISOString()
        },
        "query": "mutation reportAssessmentDuration($challengeId: ID!, $assessmentId: ID!, $questionId: ID!, $questionNumber: Int!, $numberOfQuestions: Int!, $eventType: DurationEventTypeEnum!, $startTs: ISODate!, $endTs: ISODate!) {\n  reportAssessmentDuration(\n    input: {challengeId: $challengeId, assessmentId: $assessmentId, questionId: $questionId, questionNumber: $questionNumber, numberOfQuestions: $numberOfQuestions, eventType: $eventType, startTs: $startTs, endTs: $endTs}\n  ) {\n    success\n    errors\n    __typename\n  }\n}\n"
    }
]
return payload;
}