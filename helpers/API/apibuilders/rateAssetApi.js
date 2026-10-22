import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import {rateAssetBody} from "../payloads/rateAssetPayload.js";



export async function rateAssetApi(request,userjwt,assetID,rating,user) {
  try {
    let headerofrateAssetApi= headerData.rateAssetHeaders(userjwt,"application/json");
    let resofheaderofrateAssetApi = await request.post(
      urlData.rateTheAssetUrl,
      {
        data: rateAssetBody(assetID,rating),
        headers: headerofrateAssetApi
      }
    );
    expect(resofheaderofrateAssetApi.status()).toBe(200);
    const resp = await resofheaderofrateAssetApi.json();
    logger.info(`user ${user} rated the asset: ${assetID} with ${rating} star`);
    return resp;
   
  } catch (error) {
    logger.error(`Failed to rate asset ${assetID} due to error: ${JSON.stringify(error)}`);
  }
       
  }