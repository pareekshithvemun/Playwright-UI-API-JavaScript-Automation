import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { addItemToPlayListBody } from "../../API/payloads/addItemsToplaylistpayload.js";
import { logger } from "../../../logger.js";



export async function addcontentBuilder(request,jwt,playListID, contentUUID,contentType) {
  try{
    let addcontentHeaders = headerData.addContentToPlayListHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.addContentToPlaylisturl, {
      data: addItemToPlayListBody(playListID, contentUUID,contentType),
      headers: addcontentHeaders,
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Content ${resp[0].data.addOrDeleteItemFromPlaylists.addItemtoPlaylists[0].id} has been added to playlist ${resp[0].data.addOrDeleteItemFromPlaylists.addItemtoPlaylists[0].playlistId}`);

  }
  catch(e){
    logger.error(`Content is not added due to error  ${e}`);
  }
     
}
