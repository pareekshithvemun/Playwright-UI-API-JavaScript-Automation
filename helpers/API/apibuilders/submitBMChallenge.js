import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { submitChallengePayload } from "../payloads/submitChallenge.js";
import { logger } from "../../../logger.js";

export async function submitChallengeApi(request,skillBenchmarkId,questionUUID,questionType,challengeUuid,questionPosition,answerParams,token){

    try {
        let headersOfsubmitChallengeApi = headerData.submitChallengeHeaders(token);
        let payload = submitChallengePayload(questionType,challengeUuid,questionPosition,answerParams);
        logger.info(JSON.stringify({
          message: `This is the payload of skillbenchmark: ${skillBenchmarkId} and questionid: ${questionUUID}: ${JSON.stringify(payload)}`
        }));
        let respOfsubmitChallengeApi  = await request.post(urlData.ChallengeSubmissionUrl, {
          data:payload,
          headers: headersOfsubmitChallengeApi,
        }
        )
        expect(respOfsubmitChallengeApi.status()).toBe(200);
        const resp = await respOfsubmitChallengeApi.json();
        return resp;
      } catch (error) {
        logger.error(`Failed to submit answer for ${questionUUID} in skillbenchmark ${skillBenchmarkId} due to error : ${error}`);
      }
}