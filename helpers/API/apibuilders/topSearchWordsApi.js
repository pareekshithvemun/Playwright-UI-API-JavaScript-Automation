import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import {postDataTopSearchedTermsBody} from "../../API/payloads/postDataTopSearchedTermspayload.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";





export async function topSearchWords(request,jwt,word) {
    try{
        let headerOfsearchWords = headerData.postDataTopSearchedTerms(jwt,"application/json");
        let res=await request.post(urlData.baseUrlOfpostDataTopSearchedTerms,{
            data:postDataTopSearchedTermsBody(word),
            headers:headerOfsearchWords,
        })
        expect(res.status()).toBe(200);
    }
    catch(error){
        logger.info(`Failed to search the given word due to error: ${error}`);
    }
}