
import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { saveContainerPayload } from "../payloads/saveContainerPayload.js";

export async function saveContainerApi(request, jwt, orgId, adminId, assetId,dynamicContentTitle,dynamicContentDescription,dynamicContentInstruction,imageUrl) {
    try {
        let headersofSaveContainer = headerData.saveContainerHeader(jwt, "application/json");
        let res = await request.post(urlData.saveContainerUrl, {
            headers: headersofSaveContainer,
            data: saveContainerPayload(orgId,adminId,assetId,dynamicContentTitle,dynamicContentDescription,dynamicContentInstruction,imageUrl)
        })
        expect(res.status()).toBe(200);
        const resp = await res.json();
        logger.info(`Container has been created with container id:${resp.containerId}`)
        return resp;
    }
    catch (error) {
        logger.info(`Failed to save container due to error: ${error}`);
    }
}