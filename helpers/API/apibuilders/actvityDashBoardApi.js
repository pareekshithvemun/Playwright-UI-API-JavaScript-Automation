import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {activityDashboardPayload} from "../payloads/activityDashBoardPayload.js";
import { logger } from "../../../logger.js";



export async function actvityDashBoardApi(request, token, preset) {
  try {
    let headersOfactvityDashBoard= headerData.activityDashBoardHeaders(token,"application/json");
    let respOfactvityDashBoard = await request.post(urlData.activityDashBoardUrl, {
      data: activityDashboardPayload(preset),
      headers: headersOfactvityDashBoard,
    });
    expect(respOfactvityDashBoard.status()).toBe(200);
    const resp = await respOfactvityDashBoard.json();
    return resp;
  } catch (error) {
    logger.info(`Failed to get activity Count in activity DashBoard due to error : ${error}`);
  }
}
