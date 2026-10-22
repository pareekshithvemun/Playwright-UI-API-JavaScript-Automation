import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";



export async function getJourneyInfo(request,jwt,journeyId) {
  try {
    let headerofgetjourneyInfo = headerData.getJourneyInfoHeaders(jwt);
    let respofjourneyinfo = await request.get(
      urlData.getJourneyInfoUrl(journeyId),
      {
        headers: headerofgetjourneyInfo,
      }
    );
    expect(respofjourneyinfo.status()).toBe(200);
    const resp = await respofjourneyinfo.json();
    const trackWithObject = resp.channelViews.find(
        (view) => view.title === "Track 1: Get started by editing this track!"
      );
      const trackId = trackWithObject ? trackWithObject.id : null;
      const trackBadgeUUID = trackWithObject && trackWithObject.badges && trackWithObject.badges.length > 0 ? trackWithObject.badges[0].badgeDesign.badgeDesignUuid : null;

    return {resp,trackId,trackBadgeUUID};
  } catch (error) {
    logger.info(`Failed to get journey info due to error: ${error}`);
  }
       
  }