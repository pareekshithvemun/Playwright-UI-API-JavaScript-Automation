import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {createLinkedContentPayload} from "../../API/payloads/createLinkedContentPayload.js"
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";



export async function createLinkedContent(request, jwt, title, url, description, imageUrl, modality, duration, skills, sourceName) {
    try {
        let uuid = reusableFunctions.uuidGenerator();
        let headersofLinkedContent = headerData.createLinkedContentPayloadHeaders(jwt, "application/json");
        let res = await request.post(urlData.getlinkedContentUrl(uuid), {
            data: createLinkedContentPayload(title, url, description, imageUrl, modality, duration, skills, sourceName),
            headers: headersofLinkedContent,
        });
        expect(res.status()).toBe(200);
        return uuid;
    } catch (error) {
        logger.error(`Failed to create linked content with title ${title} due to ${error}`);
    }
}
