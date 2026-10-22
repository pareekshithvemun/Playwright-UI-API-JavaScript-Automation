import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {createAssessmentpayload} from "../../API/payloads/createAssessmentpayload.js"
import { logger } from "../../../logger.js";

export async function createSBAssessmentApi(request,uuid,token){
    try {
        let headersOfcreateSBAssessmentApi = headerData.startBMAssessmentHeaders(token);
        let payload = await createAssessmentpayload(uuid);
        let respOfcreateSBAssessmentApi  = await request.post(urlData.createAssessment, {
          data:payload,
          headers: headersOfcreateSBAssessmentApi,
        });
        expect(respOfcreateSBAssessmentApi.status()).toBe(200);
        const resp = await respOfcreateSBAssessmentApi.json();
        return resp;
      } catch (error) {
        logger.error(`Failed to start Skill Benchmark Assessment for uuid ${uuid} due to error : ${error}`);
      }
}