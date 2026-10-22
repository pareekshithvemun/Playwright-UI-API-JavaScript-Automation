import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function getAllStripsApi(request,jwt) {
    try {
        let headerofGetStripsFromOrg = headerData.getAllStripHeaders(
          jwt,
          "application/json"
        );
        let resofGetStripApi = await request.post(urlData.getAllStripsUrl, {
          data: [],
          headers: headerofGetStripsFromOrg,
        });
        expect(resofGetStripApi.status()).toBe(200);
        const resp = await resofGetStripApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get Strips from Org due to error : ${error}`);
      }
}
 