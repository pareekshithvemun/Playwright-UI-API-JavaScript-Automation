import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function getAllBannersApi(request,jwt) {
    try {

        let headerofGetBannersFromOrg = headerData.getAllBannerHeaders(

          jwt,
          "application/json"
        );
        let resofGetBannerApi = await request.post(urlData.getAllBannersUrl, {
          data: [],

          headers: headerofGetBannersFromOrg,

        });
        expect(resofGetBannerApi.status()).toBe(200);
        const resp = await resofGetBannerApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get Banners from Org due to error : ${error}`);
      }
}
 