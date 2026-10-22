import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { getContainerViewPayload } from "../payloads/getContainerViewPayload.js";

export async function getContainerViewApi(request,jwt,containerId, orgId) {
    try{
        let headersofgetContainerView = headerData.getContainerViewHeader(jwt,"application/json");
        let res=await request.post(urlData.getContainerView,{
            headers:headersofgetContainerView,
            data: getContainerViewPayload(containerId, orgId)
        })
        expect(res.status()).toBe(200);
        let resp=await res.json();
        return resp
    }
    catch(error){
        logger.info(`Failed to get response due to error: ${error}`);
    }
}