import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function publishJourney(request, jwt, channelid, journeyName) {
  try {
    let headerofcustomChannel = headerData.publishChannelorJourneyHeaders(jwt);
    let resofPublishChannelApi = await request.post(
      urlData.publishChannelorJourneyUrl(channelid),
      {
        headers: headerofcustomChannel,
      }
    );
    logger.info(urlData.publishChannelorJourneyUrl(channelid));
    const resp = await resofPublishChannelApi.json();
    logger.info(resp); // Log response body before expect
    expect(resofPublishChannelApi.status()).toBe(200);
    if (resp["message"] === "channel published") {
      logger.info(
        `Journey ${journeyName} with ${channelid}  has been published`
      );
    }
  } catch (error) {
    logger.error(
      `Failed to publish journey ${journeyName} due to ${JSON.stringify(error)}`
    );
  }
}
