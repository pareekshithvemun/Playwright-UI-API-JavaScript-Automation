import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { getSubmissionPayload } from "../payloads/getSubmissionpayload.js";
import { logger } from "../../../logger.js";

export async function getSubmissionApi(request,uuId,assessmentId,questionuuid,challengeUuid,token){

    try {
        let headersOfgetSubmissionApi = headerData.getSubmissionHeaders(token);
        let payload = await getSubmissionPayload(uuId,assessmentId,questionuuid,challengeUuid);
        let respOfgetSubmissionApi  = await request.post(urlData.getSubmissionUrl, {
          data:payload,
          headers: headersOfgetSubmissionApi,
        }
        )
        expect(respOfgetSubmissionApi.status()).toBe(200);
        const resp = await respOfgetSubmissionApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get submission for ${challengeUuid} due to error : ${error}`);
      }
}