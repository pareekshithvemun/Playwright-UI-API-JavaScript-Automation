import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getAllAttributesApi(request,token,attributeName){

    try {
        let headersOfgetAllAttributesApi = headerData.getAllAttributesHeaders(token);
        let respOfgetAllAttributesApi= await request.get(urlData.getAllAttributesUrl, {
          headers: headersOfgetAllAttributesApi
        });
        expect(respOfgetAllAttributesApi.status()).toBe(200);
        const resp = await respOfgetAllAttributesApi.json();
        let demoAttribute=resp.attributes.find((item)=>item.name===attributeName);
        let customAttributeUuid = demoAttribute ? demoAttribute.customAttributeUuid : null;
        return {resp,customAttributeUuid};
      } catch (error) {
        logger.info(`Failed to get attribute ID of ${attributeName} due to error: ${error}`);
      }

}
