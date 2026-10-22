import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {saveUserInterestBody} from "../../API/payloads/saveUserInterest.js";
import { logger } from "../../../logger.js";


export async function saveUserInterestApi(request,jwt,InterestArray) {
    try{
        let headerOfsaveUserInterestApi= headerData.saveInterestOfUserHeaders(jwt,"application/json");
        let res=await request.post(urlData.saveInterestOfUserUrl,{
            data: saveUserInterestBody(InterestArray),
            headers:headerOfsaveUserInterestApi,
        })
        expect(res.status()).toBe(200);
        const resp=await res.json();
        logger.info(resp);
    }
    catch(error){
        logger.info(`Failed to save user interests due to error: ${JSON.stringify(error)}`);
    }
}