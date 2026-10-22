import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {addtrack} from "../../API/payloads/addTrackToJourneypayload.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";





export async function addTrackToJourney(request,jwt,channelid,content,trackposition,trackName,trackDescription,currentTrackImage,badgeID,enableBadging = true) {
    let uuid = reusableFunctions.uuidGenerator();
    try{
      let headerDataofAddTrack = headerData.addTrackToJourneyHeaders(
        jwt,
        "application/json"
      );
      let res = await request.post(urlData.addTrackorRelatedContentToJourneyUrl(uuid), {
        data: addtrack(channelid,content,trackposition,trackName,trackDescription,currentTrackImage,badgeID,enableBadging),
        headers: headerDataofAddTrack,
      });
      expect(res.status()).toBe(200);
      const resp = await res.json();
      if(resp.message==="channel view created"){
        logger.info(`${trackName} track has been added`);
      }   
    }
    catch(e){
      logger.error(`Failed to add track ${trackName} due to error:${JSON.stringify(e)}`);
    }
       
  }