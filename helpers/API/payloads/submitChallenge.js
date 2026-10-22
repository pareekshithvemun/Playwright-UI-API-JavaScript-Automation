import { logger } from "../../../logger.js";

export function submitChallengePayload(questionType,challengeUuid,questionPosition,answerParams){
    let payload;
if(questionType==='multiple_choice'||questionType==='ranking')
{
    logger.info("multi choice and ranking question when answer is null/not null");
    logger.info(answerParams);
    logger.info(typeof(answerParams));
    payload = [
        {
            "operationName": "createChallengeSubmission",
            "variables": {
                "challengeId": challengeUuid,
                "questionPosition": questionPosition,
                "answerParams": answerParams
                
            },
            
            "query": "mutation createChallengeSubmission($questionPosition: Int!, $challengeId: String!, $answerParams: String) {\n  createChallengeSubmission(\n    input: {questionPosition: $questionPosition, challengeId: $challengeId, answerParams: $answerParams}\n  ) {\n    id: uuid\n    answerCount\n    answers\n    assessmentsChallengeQuestionUuid\n    correctCount\n    maxCorrect\n    score\n    __typename\n  }\n}\n"
        }
    ]
}
else if(questionType==='matching' && answerParams!=="null")
{
    logger.info("matching question when answer is not null");
    logger.info(answerParams);
    logger.info(typeof(answerParams));
    payload = [
        {
            "operationName": "createChallengeSubmission",
            "variables": {
                "challengeId": `${challengeUuid}`,
                "questionPosition": questionPosition,
                "answerParams": `{${answerParams}}`
                
            },
            
            "query": "mutation createChallengeSubmission($questionPosition: Int!, $challengeId: String!, $answerParams: String) {\n  createChallengeSubmission(\n    input: {questionPosition: $questionPosition, challengeId: $challengeId, answerParams: $answerParams}\n  ) {\n    id: uuid\n    answerCount\n    answers\n    assessmentsChallengeQuestionUuid\n    correctCount\n    maxCorrect\n    score\n    __typename\n  }\n}\n"
        }
    ]
}
else if(answerParams==="null")
{
    logger.info("matching question when answer is null");
    logger.info(answerParams);
    logger.info(typeof(answerParams));
    payload = [
        {
            "operationName": "createChallengeSubmission",
            "variables": {
                "challengeId": `${challengeUuid}`,
                "questionPosition": questionPosition,
                "answerParams": answerParams
                
            },
            
            "query": "mutation createChallengeSubmission($questionPosition: Int!, $challengeId: String!, $answerParams: String) {\n  createChallengeSubmission(\n    input: {questionPosition: $questionPosition, challengeId: $challengeId, answerParams: $answerParams}\n  ) {\n    id: uuid\n    answerCount\n    answers\n    assessmentsChallengeQuestionUuid\n    correctCount\n    maxCorrect\n    score\n    __typename\n  }\n}\n"
        }
    ]
}


return payload;

}