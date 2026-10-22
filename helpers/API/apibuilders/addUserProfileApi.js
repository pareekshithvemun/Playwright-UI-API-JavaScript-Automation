import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {addUserProfilePayload} from "../payloads/addUserProfilePayload.js";
import { logger } from "../../../logger.js";


export async function addUserProfileApi(request,token,url,user) {
  try {
    let headersOfAddUserProfileApi= headerData.addUserProfileHeaders(token,"application/json");
    let respOfaddUserProfileApi= await request.post(urlData.editUserImageUrl, {
      data: addUserProfilePayload(url),
      headers: headersOfAddUserProfileApi,
    });
    expect(respOfaddUserProfileApi.status()).toBe(200);
    const resp = await respOfaddUserProfileApi.json();
    logger.info(`upload new user profile for user ${user}`);
    return resp;
  } catch (error) {
    logger.error(`Failed to upload new user profile for user ${user} due to error : ${error}`);
  }
}
