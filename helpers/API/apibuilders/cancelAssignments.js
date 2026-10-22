import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function cancelAssignmentsApi(request,jwt,assignID) {
    try {

        let cancelAssignmentsHeaders = headerData.cancelAssignmentHeader(jwt);
        let resofcancelAssignmentsApi = await request.put(urlData.cancelAsignmentUrl(assignID), {
          headers: cancelAssignmentsHeaders,
        });
        expect(resofcancelAssignmentsApi.status()).toBe(200);
        const resp = await resofcancelAssignmentsApi.json();
        logger.info(`${assignID} has been ${resp.status}`);
        return resp;
      } catch (error) {
        logger.info(`Failed to cancel assignment ${assignID}  due to error : ${error}`);
      }
}
 