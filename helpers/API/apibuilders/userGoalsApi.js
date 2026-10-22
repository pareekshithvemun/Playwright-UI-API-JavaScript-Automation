import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { userGoalsPayload } from "../../API/payloads/userGoalsPayload.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function setUserGoals(request, jwt, duration = 30) {
    try {
        let headerOfsetUserGoals = headerData.userGoalsHeader(jwt, "application/json");
        let res = await request.post(urlData.userGoalsUrl, {
            data: userGoalsPayload(duration),
            headers: headerOfsetUserGoals,
        })
        expect(res.status()).toBe(200);
        logger.info(`Goal created successfully ${res}`)
    }
    catch (error) {
        logger.info(`Failed to create goal due to : ${error}`);
    }
}