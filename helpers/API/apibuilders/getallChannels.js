import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { getChannelsBody } from "../../API/payloads/getChannelsFromOrgpayload.js";
import { logger } from "../../../logger.js";


export async function getAllChannelsApi(request,jwt) {
    try {
        let headerofGetChannelsFromOrg = headerData.getChannelFromOrgHeaders(
          jwt,
          "application/json"
        );
        let resofGetChannelApi = await request.post(urlData.getChannelsorJourneysInOrgUrl, {
          data: getChannelsBody(),
          headers: headerofGetChannelsFromOrg,
        });
        expect(resofGetChannelApi.status()).toBe(200);
        const resp = await resofGetChannelApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get Channels from Org ${error}`);
      }
}
 