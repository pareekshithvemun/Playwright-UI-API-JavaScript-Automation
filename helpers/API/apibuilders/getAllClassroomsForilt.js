import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function getAllClassroomsForiltApi(request,jwt) {
    try {
        let headerofGetAllClassroomsForilt= headerData.getClassRoomsForIltHeaders(jwt)
        let resofGetAllClassroomsForilt = await request.get(urlData.getAllClassRoomsForIltUrl, {
          headers: headerofGetAllClassroomsForilt,
        });
        expect(resofGetAllClassroomsForilt.status()).toBe(200);
        const resp = await resofGetAllClassroomsForilt.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get all Classrooms of ILT from Org due to error : ${error}`);
      }
}
 