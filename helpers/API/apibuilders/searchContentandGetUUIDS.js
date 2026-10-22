import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {searchItemBody} from "../../API/payloads/searchItemPayload.js";
import { logger } from "../../../logger.js";


export async function searchContentandGetUUIDSApi(request,jwt,pagesize, content) {
    try{
        let headerOfsearchContentApi= headerData.searchContentHeaders(jwt,"application/json");
        let res=await request.post(urlData.searchContentUrl,{
            data: searchItemBody(pagesize, content),
            headers:headerOfsearchContentApi
        })
        expect(res.status()).toBe(200);
        const resp=await res.json();
        return resp;
        
    }
    catch(error){
        logger.info(`Failed to get search results for keyword ${content}, due to error: ${JSON.stringify(error)}`);
    }
}