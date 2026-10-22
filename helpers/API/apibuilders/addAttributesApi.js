import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {addAttributeValuesBody} from "../../API/payloads/addAttributeValuesPayload.js";
import { logger } from "../../../logger.js";





export async function addAttributeValuesApi(request,jwt,attributeUUID,attributeName,attributeValues) {
    try{
      let headerDataofaddAttributeValuesApi= headerData.addAttributeValuetoAttributes(
        jwt,
        "application/json"
      );
      let res = await request.put(urlData.editListAttribute(attributeUUID), {
        data: addAttributeValuesBody(attributeName,attributeValues),
        headers: headerDataofaddAttributeValuesApi,
      });
      expect(res.status()).toBe(200);
      const resp = await res.json();
      logger.info(`Added attributeValues:${attributeValues} to attribute:${attributeName}`)
      return resp;
     
    }
    catch(e){
      console.log(e);
      logger.error(`Failed to add attributeValues to attribute:${attributeName} due to error:${JSON.stringify(e)}`);
    }
       
  }