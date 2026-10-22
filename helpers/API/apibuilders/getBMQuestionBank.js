import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getBMQuestionBankApi(request,benchMrkId,token){

    try {
        let headersOfgetBMQuestionBankApi = headerData.getBMQuestionBankHeaders(token);
        let respOfgetgetBMQuestionBankApi = await request.get(urlData.getBMQuestionBankUrl(benchMrkId), {
          headers : headersOfgetBMQuestionBankApi
        });
        expect(respOfgetgetBMQuestionBankApi.status()).toBe(200);
        const resp = await respOfgetgetBMQuestionBankApi.json();
        return resp;
      } catch (error) {
        logger.error(`Failed to get Question Banks from BM ${benchMrkId} due to error : ${error}`);
      }

}
