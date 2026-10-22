import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getallplayLists } from "../../../helpers/API/apibuilders/getallplayLists.js";
import { dataOfplayList } from "../../../helpers/API/response/getallplayListsresponse.js";
import { logger } from "../../../logger.js";
import { deletePlayListapi } from "../../../helpers/API/apibuilders/deleteAllPlayListsApi.js";

test("Create playlist and add Content for Existing Users", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(500000);
  let pathofuserData = "testData/usersData/defaultUsers.json";
  let defaultUsers =
    reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
  for (let data of defaultUsers.defaultUsersData) {
    let userToken = await generateTokenLearner(
      request,
      data.loginName,
      data.passWord
    );
    if (userToken) {
      await deletePlayList(request, userToken, data.loginName);
    } else {
      logger.info(
        `Failed to delete playlist for user ${data.loginName} due to token issue`
      );
    }
  }
});

async function deletePlayList(request, jwt, user) {
  try {
    let playListids = [];
    await getallplayLists(request, jwt); 
    playListids = dataOfplayList.getAllplayListIds();
    logger.info(`About to delete all playlists for user ${user}`);
    logger.info(playListids);

    for (let id of playListids) {
      await deletePlayListapi(request,jwt,id,user);
    }
  } catch (e) {
    logger.error(`playList deletion failed for user ${user} due to error ${e}`);
  }
}
