import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { createPlayListBody } from "../../API/payloads/createplayListpayload.js";
import { logger } from "../../../logger.js";



export async function createplaylistbuilder(request,jwt,playlistName,user) {
  try{
    let headerofcreateplayList = headerData.createPlayListHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.createPlayListUrl, {
      data: createPlayListBody(playlistName),
      headers: headerofcreateplayList,
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`playList has been created with id ${resp[0].data.createPlaylist.id} for user ${user}`);

  }
  catch(e){
    logger.error(`playlist creation failed due to error ${e} for user ${user}`);
  }
     
}
