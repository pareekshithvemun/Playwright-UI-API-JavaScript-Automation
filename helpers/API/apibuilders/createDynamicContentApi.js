import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {dynamicContentPayload} from "../../API/payloads/dynamicContentPayload.js";
import { logger } from "../../../logger.js";




export async function createDynamicContentApi(request,jwt,assetId,dynamicContentTitle,dynamicContentDescription,imageUrl,subjectUuidArray) {
    try{
      let createDynamicHeader = headerData.createDynamicContentHeader(
        jwt,
        "application/json"
      );
      let res = await request.post(urlData.createDynamicContentUrl(assetId), {
        data: dynamicContentPayload(assetId,dynamicContentTitle,dynamicContentDescription,imageUrl,subjectUuidArray),
        headers: createDynamicHeader,
      });
      expect(res.status()).toBe(200);
      const resp = await res.json();
      logger.info(`${resp.message} for the dynamic content with assetid:${assetId}`);
  
    }
    catch(e){
      logger.info(`Failed to create asset due to an error:${e}`);
    }
       
  }