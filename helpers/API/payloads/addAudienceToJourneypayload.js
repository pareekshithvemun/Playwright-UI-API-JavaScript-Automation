import reusableFunctions from "../../UI/commonFunctions.js";
import { createuserdata } from "../response/createUserresponse.js";
import config from "config";
import { logger } from "../../../logger.js";

// Read the flag inside the function. Calling it at import time runs before commonFunctions has finished loading.
function isDynamic() {
  return Boolean(reusableFunctions.toogleDynamic());
}

export function getAudIds() {
  let audUUID;
  if (isDynamic()) {
    if (process.env.Area == "true") {
      audUUID =
        config.get("CustomJourney").auduuidrelatedToJourney;
        logger.info('In area=true block');
    } else {
      audUUID = createuserdata.getAudId();
      logger.info('In true block');
    }
  } else {
    audUUID =
      config.get("CustomJourney").auduuidrelatedToJourney;
      logger.info('In false block');
  }
  return audUUID;
}


export function addAudienceToJourneybody(audUUID) {
  return {
    audienceUuids: audUUID,
  };
}
