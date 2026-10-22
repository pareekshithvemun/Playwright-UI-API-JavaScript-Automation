import { test, expect } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { addAudToJourneyApi } from "../../../helpers/API/apibuilders/addaudtoJourney.js";
import { addTrackToJourney } from "../../../helpers/API/apibuilders/addtrackToJourney.js";
import { createJourney } from "../../../helpers/API/apibuilders/createJourney.js";
import { getjourneyId } from "../../../helpers/API/apibuilders/getalljournies.js";
import { getsubIDs } from "../../../helpers/API/payloads/createChannelpayload.js";
import { publishJourney } from "../../../helpers/API/apibuilders/publishjourney.js";
import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { getAudIds } from "../../../helpers/API/payloads/addAudienceToJourneypayload.js";
import { getJourneyInfo } from "../../../helpers/API/apibuilders/getJourneyInfo.js";
import { deletetrackapi } from "../../../helpers/API/apibuilders/deleteTrack.js";
import config from "config";
import { logger } from "../../../logger.js";

// let journeyData = config.get("CustomJourney").JourneyNames;
// let trackData = config.get("CustomJourney").Tracks;
let jwt, audid;

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
  logger.info(jwt);
});

test(`Create Journey  @areaCreation`, async ({ request }, testInfo) => {
  audid = await getAudIds();
  for (let i = 0; i < journeyData.length; i++) {
    testInfo.setTimeout(50000);
    try {
      let resdata = await apiresponseValidations.getAreasAndSubJects(
        request,
        urlData.getAreasOfOrgUrl,
        jwt,
      );
      expect(resdata.status()).toBe(200);
    } catch (error) {
      testInfo.fail(
        true,
        `Failed to get areaorsubuuids due to error: ${error}`,
      );
    }
    let subidIndex = i % getsubIDs().length;
    let subid = getsubIDs()[subidIndex];
    await createJourney(request, jwt, journeyData[i], subid);
    let journeyUUId = await getjourneyId(request, jwt, journeyData[i]);
    logger.info(`JourneyUUId of ${journeyData[i]} is ${journeyUUId}`);
    let currentTrackName = trackData[i % trackData.length]["trackName"];
    let currentTrackContent = trackData[i % trackData.length]["trackContent"];
    await addTrackToJourney(
      request,
      jwt,
      journeyUUId,
      currentTrackContent,
      currentTrackName,
    );
    await addAudToJourneyApi(request, jwt, journeyUUId, audid);
    let tracktoBeDeleted = await getJourneyInfo(request, jwt, journeyUUId);
    await deletetrackapi(request, jwt, tracktoBeDeleted.trackId);
    await publishJourney(request, jwt, journeyUUId);
  }
});
