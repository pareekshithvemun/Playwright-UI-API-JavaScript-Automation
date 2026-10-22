export async function createAssessmentpayload(uuid){
    return [
            {
                "operationName": "createAssessmentAssetChallenge",
                "variables": {
                    "uuid": `${uuid}`,
                },
                "query": `mutation createAssessmentAssetChallenge($uuid: ID!) {\n  createChallenge(assessmentId: $uuid) {\n    id: uuid\n    assessmentUuid: ucsAssessmentUuid\n    questions: challengeQuestions {\n      id: uuid\n      challengeUuid\n      choiceIds: choiceUuids\n      optionIds: optionUuids\n      position\n      questionType\nquestionUuid: ucsQuestionUuid\n      __typename\n    }\n    __typename\n  }\n}\n`
            }
        ]
}