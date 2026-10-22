import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function deletetrackapi(request, jwt, trackID) {
  try {
    let headerofdeleteTrack = headerData.deletetrackHeaders(jwt);
    let respofjourneyinfo = await request.delete(
      urlData.deleteTrackUrl(trackID),
      {
        headers: headerofdeleteTrack,
      }
    );
    logger.info(urlData.deleteTrackUrl(trackID));
    expect(respofjourneyinfo.status()).toBe(200);
    const resp = await respofjourneyinfo.json();
    if (resp["message"] === "channel view deleted") {
      logger.info(`Track ${trackID} has been deleted`);
    }
  } catch (error) {
    logger.info(`Unable to delete track due to error: ${error}`);
  }
}
