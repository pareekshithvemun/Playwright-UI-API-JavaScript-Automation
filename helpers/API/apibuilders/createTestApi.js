import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {createTestPayload} from "../../API/payloads/createTestPayload.js"
import { logger } from "../../../logger.js";

export async function createTestApi(request,token,assessmentId,courseId){
    try {
        let headersOfTestApi = headerData.createTestHeaders(token,"application/json");
        let payload = await createTestPayload(assessmentId, courseId);
        let respOfcreateTestApi  = await request.post(urlData.createTest, {
          data:payload,
          headers: headersOfTestApi,
        });
        expect(respOfcreateTestApi.status()).toBe(200);
        const resp = await respOfcreateTestApi.json();
        return resp;
      } catch (error) {
        logger.error(`Failed to start Course Test for assesmentId ${assessmentId} due to error : ${error}`);
      }
}