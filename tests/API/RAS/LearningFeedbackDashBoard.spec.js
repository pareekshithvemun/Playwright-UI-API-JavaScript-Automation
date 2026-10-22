import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { getContentUUIdsApi } from "../../../helpers/API/apibuilders/getContentUUID.js";
import { getAllUserApi } from "../../..//helpers/API/apibuilders/getAllUsers.js";
import { logger } from "../../../logger.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import { rateAssetApi } from "../../../helpers/API/apibuilders/rateAssetApi.js";
import config from "config";

let jwt,
  adminUserId,
  allUserResponse,
  allContentUUIdsApiresponse,
  orgId,
  shuffledContent;

test.beforeEach("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Get alluser orgid and content In org", async ({ request }, testInfo) => {
  testInfo.setTimeout(300000);
  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
  orgId = config.get("Environment").orgId;
  logger.info(`OrgId:${orgId}`);
  allContentUUIdsApiresponse = await getContentUUIdsApi(
    request,
    jwt,
    orgId,
    adminUserId,
    300
  );
});

test("Populate data in  LearningFeedbackDashBoard", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(9000000);
  //limiting number of users and before that shuffling data in user array
  let shuffledUsers = reusableFunctions.shuffleDataInArray(
    allUserResponse.users
  );
  let UserArray = reusableFunctions.limitTheArrayData(shuffledUsers, 5);
  logger.info(`Lenght of user array ${UserArray.length}`);

  let filteredContent =
    allContentUUIdsApiresponse[0]?.data?.dwAllContentListingRows
      ?.filter((item) => item.estimated_duration_seconds !== null)
      .map((item) => item.asset_uuid);

  // removing duplicated from content array
  let filteredContentwithoutDuplicates =
    removingDuplicateElementsFromArray(filteredContent);

  //shuffling content UUIDS data
  shuffledContent = reusableFunctions.shuffleDataInArray(
    filteredContentwithoutDuplicates
  );

  //limiting the content array
  let LimitedContentwithoutDuplicates = reusableFunctions.limitTheArrayData(
    shuffledContent,
    6
  );
  logger.info(
    `Lenght of content array ${LimitedContentwithoutDuplicates.length}`
  );

  for (let data of UserArray) {
    let userToken = await generateTokenLearner(
      request,
      data.loginName,
      config.get("Admindata").password
    );
    if (userToken) {
      for (let assetID of LimitedContentwithoutDuplicates) {
        let rating = generateRandomNumber();
        await rateAssetApi(request, userToken, assetID, rating, data.loginName);
      }
    } else {
      logger.error(
        `Failed to rate content for user ${data.loginName} due to token issue`
      );
    }
  }
});

function generateRandomNumber() {
  const randomNumber = Math.random();

  if (randomNumber < 0.94) {
    // Return 5 for 94% of the time
    return 5;
  } else {
    // Return a random integer between 2 and 4 for the remaining 8% of the time
    return Math.floor(Math.random() * 3) + 2;
  }
}

function removingDuplicateElementsFromArray(array) {
  let uniqueArray = [];
  for (let i = 0; i < array.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < uniqueArray.length; j++) {
      if (array[i] === uniqueArray[j]) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      uniqueArray.push(array[i]);
    }
  }
  return uniqueArray;
}
