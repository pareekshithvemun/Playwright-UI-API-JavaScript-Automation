export async function createTestPayload(assessmentId, courseId) {
    return [
        {
            "operationName": "createChallenge",
            "variables": {
                "assessment": {
                    "assessmentId": assessmentId,
                    "challengeType": "ASSESSMENT",
                    "courseId": courseId,
                    "instanceNumber": 1
                }
            },
            "query": "mutation createChallenge($assessment: ChallengeInput!) {\n  createAssessmentChallenge(input: $assessment) {\n    id: uuid\n    assessmentUuid: ucsAssessmentUuid\n    courseUuid: parentUuid\n    errors\n    grade\n    activeQuestionPosition\n    questions: challengeQuestions {\n      id: uuid\n      challengeUuid\n      choiceIds: choiceUuids\n      optionIds: optionUuids\n      position\n      questionType\n      questionUuid: ucsQuestionUuid\n      __typename\n    }\n    score\n    courseId: courseUuid\n    __typename\n  }\n}\n"        }
    ]
}