import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { addtrack } from "../../API/payloads/addTrackToJourneypayload.js";
import { logger } from "../../../logger.js";

export async function updateTrack(
  request,
  jwt,
  trackId,
  journeyId,
  contentItems,
  position,
  trackTitle,
  description,
  imageUrl,
  badgeID = null
) {
  let headerofaddcontentToChannel = headerData.addContentToChannelHeaders(
    jwt,
    "application/json"
  );

  try {
    let resofaddContentToTrack = await request.put(
      urlData.deleteTrackUrl(trackId),
      {
        data: addtrack(
          journeyId,
          contentItems,
          position,
          trackTitle,
          description,
          imageUrl,
          badgeID
        ),
        headers: headerofaddcontentToChannel,
      }
    );
    expect(resofaddContentToTrack.status()).toBe(200);
  } catch (error) {
    logger.error(`Unable to add content due to error" ${error}`);
  }
}
