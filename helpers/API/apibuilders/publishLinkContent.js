import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";



export async function publishLinkContent(request, jwt, uuid) {
    try {
        let headerofpublishlinkedContent = headerData.publishlinkedContentHeaders(jwt, "application/json");
        let res = await request.post(urlData.publishlinkedContentUrl(uuid), {
            data: {},
            headers: headerofpublishlinkedContent,
        })
        expect(res.status()).toBe(200);
        logger.info(`Linked content ${uuid} has been published`);
    }
    catch (error) {
        logger.error(`Failed to publish link content with uuid ${uuid} due to ${error}`);
    }
}
