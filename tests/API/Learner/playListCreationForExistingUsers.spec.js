import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { createplaylistbuilder } from "../../../helpers/API/apibuilders/createplaylist.js";
import { getallplayLists } from "../../../helpers/API/apibuilders/getallplayLists.js";
import { dataOfplayList } from "../../../helpers/API/response/getallplayListsresponse.js";
import { addcontentBuilder } from "../../../helpers/API/apibuilders/addContentToPlaylist.js";
import { logger } from "../../../logger.js";

test("Create playlist and add Content for Existing Users", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(500000);
  const { primary: playlistBasename, secondary: userBasename } =
    reusableFunctions.splitFileNameEnv();
  if (!playlistBasename || !userBasename) {
    throw new Error(
      "Set FileName=playlistBasename,userBasename (e.g. playListDataOne,defaultUsers)",
    );
  }
  let pathofuserData = reusableFunctions.getPath(
    "testData/usersData",
    `${userBasename}.json`,
  );
  let defaultUsers =
    reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
  for (let data of defaultUsers.defaultUsersData) {
    let userToken = await generateTokenLearner(
      request,
      data.loginName,
      data.passWord
    );
    if (userToken) {
      await createPlayList(request, userToken, data.loginName, playlistBasename);
    } else {
      logger.info(
        `Failed to create playlist for user ${data.loginName} due to token issue`
      );
    }
  }
});

async function createPlayList(request, jwt, user, playlistBasename) {
  let playListFilepath = reusableFunctions.getPath(
    "testData/PlayListData",
    `${playlistBasename}.json`,
  );
  try {
    let data = reusableFunctions.readDatafromJsonFilenotasync(playListFilepath);
    let playListData = data.PLAYLISTDATA;
    let playListids = [];
    for (let name of playListData) {
      await createplaylistbuilder(request, jwt, name.playListName, user);
      await getallplayLists(request, jwt, playListData);
      playListids = dataOfplayList.getCurrentSessionplayListIds();
    }

    for (let id of playListids) {
      for (let content of playListData[playListids.indexOf(id)]
        .playListContent) {
        await addcontentBuilder(
          request,
          jwt,
          id,
          content.contentItemUuid,
          content.contentItemTypeName
        );
      }
    }
  } catch (e) {
    logger.error(`playcreation failed due to error ${e}`);
  }
}
