import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function deleteArea(request,jwt,areaID) {
    let res,resp,text
    try{
        let headerOfDeltearea = headerData.deleteAreaHeaders(jwt);
        res=await request.delete(urlData.deleteAreaUrl(areaID),{
            headers:headerOfDeltearea,
        })
        expect(res.status()).toBe(200);
        resp=await res.json();
        text=resp["message"];
        logger.info(text);
    }
    catch(error){
        resp=await res.json();
        text=resp["message"];
        if(res.status()===412){
            logger.info(text);
        }
        else{
            logger.info(`Failed to delete area due to error: ${error}`);
        }
        
    }
}