import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { getplaylistsbody } from "../../API/payloads/getplaylistspayload.js";
import { dataOfplayList } from "../../API/response/getallplayListsresponse.js";
import { logger } from "../../../logger.js";



export async function getallplayLists(request, jwt,playListData = null) {
  let allPlayListIDs = [];
  let currentSessionplayListIDs = [];
  try {
    let headerofgetAllPlayList = headerData.getplayListHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.getAllPlayListUrl, {
      data: getplaylistsbody(),
      headers: headerofgetAllPlayList,
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    allPlayListIDs = resp[0]["data"]["userPlaylistsWithLimitedItems"]["rows"].map(
      (item) => item.id
    );
    dataOfplayList.setAllplayListIds(allPlayListIDs);

    if(playListData){
      playListData.forEach((playlist) => {
        let playlistName = playlist.playListName;
        resp[0]["data"]["userPlaylistsWithLimitedItems"]["rows"].forEach((item) => {
          if(item.name === playlistName){
              currentSessionplayListIDs.push(item.id);
          }
         
        });
      });
      dataOfplayList.setCurrentSessionplayListIds(currentSessionplayListIDs);
    }
    else{
      logger.info("playListData is not provided to fetch current session playlist Ids");
    }
  } catch (e) {
    logger.info(`Failed to get playlist due to ${e}`);
  }
}
