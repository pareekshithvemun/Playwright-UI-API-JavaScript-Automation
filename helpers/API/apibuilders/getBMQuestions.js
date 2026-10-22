import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function getBMQuestionsApi(request,questionBankUuid,token){

    try {
        let headersOfgetBMQuestionsApi = headerData.getBMQuestionsHeaders(token);
        let respOfgetBMQuestionsApi = await request.get(urlData.getBMQuestionsUrl(questionBankUuid), {
          headers: headersOfgetBMQuestionsApi
        });
        expect(respOfgetBMQuestionsApi.status()).toBe(200);
        const resp = await respOfgetBMQuestionsApi.json();
        return resp;
      } catch (error) {
        logger.error(`Failed to get Questions from Question Bank ${questionBankUuid} due to error : ${error}`);
      }

}
