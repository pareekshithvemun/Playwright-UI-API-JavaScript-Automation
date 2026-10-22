import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import {createcustomJourney} from "../../API/payloads/createJourneypayload.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";




export async function createJourney(
  request,
  jwt,
  journeyName,
  subUUID,
  journeyDescription,
  journeyImage,
  skills,
  journeyStyle,
  enableBadging = true
) {
    let uuid = reusableFunctions.uuidGenerator();
    try {
      let headerDataofCreateJourney = headerData.createJourneyHeaders(jwt, "application/json");
      let res = await request.post(urlData.createJourneyUrl(uuid), {
        data: createcustomJourney(uuid, journeyName, subUUID, journeyDescription, journeyImage, skills, journeyStyle, enableBadging),
        headers: headerDataofCreateJourney,
      });
      
      if (res.status() === 200) {
        logger.info(`Journey "${journeyName}" created successfully`);
      } else {
        logger.warn(`Journey "${journeyName}" creation returned ${res.status()}`);
      }
    } catch (e) {
      logger.error(`Failed to create journey "${journeyName}": ${e.message}`);
    }
  }