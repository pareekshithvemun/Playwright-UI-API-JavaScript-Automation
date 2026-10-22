import reusableFunctions from "../../UI/commonFunctions.js";
import {createuserdata} from "../response/createUserresponse.js";
import { getAllAudienceApi } from "../../../helpers/API/apibuilders/getallAudience.js";
import { logger } from "../../../logger.js";

let audUUID;

// Read the flag inside the function. Calling it at import time runs before commonFunctions has finished loading.
export async function createStripBody(stripTitle,stripContent,stripduration,request,jwt,audName,localeCode) {
  let time=reusableFunctions.generateTime(stripduration);
  let startTime= time.currentTime;
  let endTime=time.endTime;
  if (Boolean(reusableFunctions.toogleDynamic())) {
    audUUID=createuserdata.getAudId();
  } else {
    audUUID =await getAllAudienceApi(audName,request, jwt);
  }
  logger.info(`Strip linked to audid: ${audUUID}`);
  return {
    "userSelectedLocale": "en-US",
    "title": stripTitle,
    "startDate":startTime,
    "isPromotionEmailEnabled":false,
   // "endDate":endTime,
    "contentItems": stripContent,
    "audienceUuids": audUUID,
    "locale": localeCode
  };
}
