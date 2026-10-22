import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {getAllInterestsOfUserPayload} from "../../API/payloads/getAllInterestofUserpayload.js";
import reusableFunctions from "../../UI/commonFunctions";
import { logger } from "../../../logger.js";


export async function getAllInterestofUserApi(request,jwt) {
    try {
        let headerofGetAllInterests = headerData.getAllInterestsOfUserHeaders(
          jwt,
          "application/json"
        );
        let resofGetAllInterests= await request.post(urlData.getAllInterestsOfUserUrl, {
          data: getAllInterestsOfUserPayload(),
          headers: headerofGetAllInterests
        });
        expect(resofGetAllInterests.status()).toBe(200);
        const resp = await resofGetAllInterests.json();
        let areaData=reusableFunctions.responseValidationofUserInterest(resp);
        logger.info(`**********AreaData************** `);
        logger.info(areaData);
        return areaData;
      } catch (error) {
        logger.info(`Failed to get All Interest of User due to error : ${error}`);
      }
}


 