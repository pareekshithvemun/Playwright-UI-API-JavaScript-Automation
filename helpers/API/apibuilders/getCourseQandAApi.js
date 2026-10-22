import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function getCourseQandAApi(request,jwt,courseId) {
    try {
        let headerofGetCourseQandAApi = headerData.getCourseQandAHeaders(
          jwt,
          "application/json"
        );
        let resofGetCourseQandAApi = await request.get(urlData.getCourseQandAUrl(courseId), {
          headers: headerofGetCourseQandAApi,
        });
        expect(resofGetCourseQandAApi.status()).toBe(200);
        const resp = await resofGetCourseQandAApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get Course Questions and Answers from Org due to error : ${error}`);
      }
}