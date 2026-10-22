import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { contentLaunchEvent } from "../payloads/contentLaunchEventPayload.js";


export async function contentLaunchEventApi(request, jwt, benchMrkId, randomuuid1,randomuuid2) {
    try {

        let contentLaunchEventHeaders = headerData.contentLaunchEventHeaders(jwt);
        let resofcontentLaunchEvent = await request.post(urlData.contentLaunchEventUrl, {
            data: contentLaunchEvent(benchMrkId, randomuuid1,randomuuid2),
            headers: contentLaunchEventHeaders
        });
        expect(resofcontentLaunchEvent.status()).toBe(200);
        const resp = await resofcontentLaunchEvent.json();
        return resp;
    } catch (error) {
        logger.info(`Failed to launch benchmark: ${benchMrkId}  due to error : ${error}`);
    }
}
