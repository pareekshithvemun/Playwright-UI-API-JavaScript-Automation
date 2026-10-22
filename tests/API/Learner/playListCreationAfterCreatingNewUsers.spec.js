import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { createplaylistbuilder } from "../../../helpers/API/apibuilders/createplaylist.js";
import { getallplayLists } from "../../../helpers/API/apibuilders/getallplayLists.js";
import { dataOfplayList } from "../../../helpers/API/response/getallplayListsresponse.js";
import { addcontentBuilder } from "../../../helpers/API/apibuilders/addContentToPlaylist.js";
import ExcelHelperAndDataGenerator from "../../../helpers/Excel/testdataofCreateuser.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { logger } from "../../../logger.js";

let jwt, excelData;

test.describe("Create playlist and add Content", async () => {
  test.beforeAll("get Token", async ({ request }) => {
    jwt = await generateToken(request);
  });
  test("Create User and store them in userArray", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(60000);
    let userdata = new ExcelHelperAndDataGenerator();
    excelData = await reusableFunctions.testCreateUser(request, jwt, userdata);
    for (let data of excelData) {
      let userToken = await generateTokenLearner(
        request,
        data.loginName,
        data.passWord
      );
      if (userToken) {
        await createPlayList(request, userToken, data.loginName);
      } else {
        logger.info(
          `Failed to create playlist for user ${data.loginName} due to token issue`
        );
      }
    }
  });
});

async function createPlayList(request, jwt, user) {
  let fileName = process.env.FileName;
  let playListFilepath = reusableFunctions.getPath(
    "testData/PlayListData",
    `${fileName}.json`
  );
  let data = reusableFunctions.readDatafromJsonFilenotasync(playListFilepath);
  let playListData = data.PLAYLISTDATA;
  let playListids = [];
  try {
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
