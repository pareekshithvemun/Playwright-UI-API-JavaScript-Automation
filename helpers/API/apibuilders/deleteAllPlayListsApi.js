
import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import {deletePlayListBody} from "../../API/payloads/deletePlayListPayload.js";



export async function deletePlayListapi(request,jwt,playListid,User) {
  try {
    let headerofdeletePlayList = headerData.deletePlayListHeaders(
        jwt,
        "application/json"
      );
    let respofDeletePlayList = await request.post(
      urlData.deletePlayListUrl,
      {
        data: deletePlayListBody(playListid),
        headers:headerofdeletePlayList,
      }
    );
    expect(respofDeletePlayList.status()).toBe(200);
    logger.info(`Deleted playList with id ${playListid}  for user ${User}`);
   
  } catch (error) {
    logger.error(`Unable to delete playList with id ${playListid}  for user ${User} due to error: ${error}`);
  }
       
  }




