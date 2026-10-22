import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function retirechannel(request,jwt,channelID) {
    try{
        let headerOfretireChannel = headerData.retireChannelHeader(jwt);
        let res=await request.put(urlData.retirechannelUrl(channelID),{
            headers:headerOfretireChannel,
        })
        expect(res.status()).toBe(200);
        const resp=await res.json();
        const text=resp["message"];
        logger.info(text);
    }
    catch(error){
        logger.info(`Failed to retire channel due to error: ${error}`);
    }
}