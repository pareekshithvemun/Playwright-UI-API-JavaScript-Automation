import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function getBusinessObjective(request,jwt) {
    try {
        let headerofGetBusinessObj = headerData.getAllBusinessObjectivHeaders(
          jwt,
          "application/json"
        );
        let resofGetBusinessObjective = await request.get(urlData.getBusinessObjectiveUrl, {
          headers: headerofGetBusinessObj,
        });
        expect(resofGetBusinessObjective.status()).toBe(200);
        const resp = await resofGetBusinessObjective.json();
        return resp.data;
      } catch (error) {
        logger.info(`Failed to get Business Objectives of current Org due to error : ${error}`);
      }
}
 