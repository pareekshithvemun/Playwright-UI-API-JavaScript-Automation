import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function deletechannel(request,jwt,channelID) {
    try{
        let headerOfDelteChannel = headerData.deleteChannelHeader(jwt);
        let res=await request.delete(urlData.deletechannelUrl(channelID),{
            headers:headerOfDelteChannel,
        })
        expect(res.status()).toBe(200);
        const resp=await res.json();
        const text=resp["message"];
        logger.info(text);
    }
    catch(error){
        logger.info(`Failed to delete channel due to error: ${error}`);
    }
}