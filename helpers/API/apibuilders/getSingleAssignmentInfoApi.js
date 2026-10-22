import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getSingleAssignmentInfoApi(request,token,assignmentUUID){

    try {
        let headersOfgetSingleAssignmentInfoApi= headerData.getSingleAssignmentHeaders(token);
        let respOfgetSingleAssignmentInfoApi = await request.get(urlData.getSingleAssignmentInfoUrl(assignmentUUID), {
          headers: headersOfgetSingleAssignmentInfoApi
        });
        expect(respOfgetSingleAssignmentInfoApi.status()).toBe(200);
        const resp = await respOfgetSingleAssignmentInfoApi.json();
        return resp;
      } catch (error) {
        logger.error(`Failed to get info of the assignment ${assignmentUUID} due to error : ${error}`);
      }

}
