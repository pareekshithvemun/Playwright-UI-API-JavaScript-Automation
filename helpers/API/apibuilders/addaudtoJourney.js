import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {addAudienceToJourneybody} from "../../API/payloads/addAudienceToJourneypayload.js";
import { logger } from "../../../logger.js";





export async function addAudToJourneyApi(request,jwt,journeyuuid,audUUID) {
    try{
      let headerDataofAddAudToJourney = headerData.addAudienceToJourney(
        jwt,
        "application/json"
      );
      let res = await request.put(urlData.addAudienceToJourneyUrl(journeyuuid), {
        data: addAudienceToJourneybody(audUUID),
        headers: headerDataofAddAudToJourney,
      });
      expect(res.status()).toBe(200);
      const resp = await res.json();
      if(resp.message==="channel audiences updated"){
        logger.info("Audience has been added to Journey");
      }
    }
    catch(e){
      logger.info(`Failed to add audience to Journey due to error:${e}`);
    }
       
  }