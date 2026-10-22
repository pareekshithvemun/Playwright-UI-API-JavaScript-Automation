import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getCourseuuidListApi(request,courseId,token){

    try {
        let headersOfgetCourseuuidListApi = headerData.getCourseuuidListHeaders(token);
        let respOfgetCourseuuidListApi = await request.get(urlData.getCourseuuidListUrl(courseId), {
          headers: headersOfgetCourseuuidListApi
        });
        expect(respOfgetCourseuuidListApi.status()).toBe(200);
        const resp = await respOfgetCourseuuidListApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get uuid from course due to error : ${error}`);
      }

}
