import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { addIntroPayload } from "../payloads/addIntroToJourneypayload.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";

export async function addIntroToJourney(
  request,
  jwt,
  channelid,
  content,
  introposition,
  introName,
  currentTrackImage,
  badgeID
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
        data: addIntroPayload(
          channelid,
          content,
          introposition,
          introName,
          currentTrackImage,
          badgeID
        ),
        headers: headerDataofAddTrack,
      }
    );
    expect(res.status()).toBe(200);
    const resp = await res.json();
    if (resp.message === "channel view created") {
      logger.info(`Intro has been added to Journey with id ${channelid}`);
    }
  } catch (e) {
    logger.error(
      `Failed to add intro with name ${introName} to journey with id ${channelid} due to error:${e}`
    );
  }
}
