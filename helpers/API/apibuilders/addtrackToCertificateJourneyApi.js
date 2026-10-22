import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { addTrackToCertificateJourneypayload } from "../payloads/addTrackToCertificateJourneypayload.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";

export async function addtrackToCertificateJourneyApi(
  request,
  jwt,
  channelid,
  content,
  trackposition,
  trackName,
  trackDescription,
  currentTrackImage,
  trackMileStone
) {
  let uuid = reusableFunctions.uuidGenerator();
  try {
    let headerDataofAddTrack = headerData.addTrackToJourneyHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(
      urlData.addTrackorRelatedContentToJourneyUrl(uuid),
      {
        data: addTrackToCertificateJourneypayload(
          channelid,
          content,
          trackposition,
          trackName,
          trackDescription,
          currentTrackImage,
          trackMileStone
        ),
        headers: headerDataofAddTrack,
      }
    );
    expect(res.status()).toBe(200);
    const resp = await res.json();
    if (resp.message === "channel view created") {
      logger.info(`${trackName} track has been added`);
    }
  } catch (e) {
    logger.error(
      `Failed to add track ${trackName} due to error:${JSON.stringify(e)}`
    );
  }
}
