import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { conentCompletionApi } from "../../../helpers/API/apibuilders/conentCompletion.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import config from "config";
import { logger } from "../../../logger.js";
import { setUserGoals } from "../../../helpers/API/apibuilders/userGoalsApi.js";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";


let jwt, allUserResponse, adminUserId, orgId;

test.beforeAll("get Token", async ({ request }) => {
    jwt = await generateToken(request);
    orgId = config.get("Environment").orgId;
});

test("Create goal for default users", async ({ request }, testInfo) => {
    testInfo.setTimeout(200000);
    let pathofuserData = "testData/usersData/defaultUsers.json";
    let defaultUsers = reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
    for (let data of defaultUsers.defaultUsersData) {
        let userToken = await generateTokenLearner(
          request,
          data.loginName,
          data.passWord
        );
        if (userToken) {
          await setUserGoals(request, userToken, 30);
        } else {
          logger.info(
            `Failed to create goal for user ${data.loginName} due to token issue`
          );
        }
    }
});

test("Fetch data and grant completion for default users", async ({ request }, testInfo) => {
    testInfo.setTimeout(200000);
    allUserResponse = await getAllUserApi(request, jwt);
    let userWithLoginName = allUserResponse.users.find(
        (user) => user.loginName === config.get("Admindata").loginID
    );
    if (userWithLoginName) {
        adminUserId = userWithLoginName.id;
        logger.info(`adminUserId: ${adminUserId}`);
    }
    let pathofuserData = "testData/usersData/defaultUsers.json";
    let defaultUsers = reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
    for (let obj of defaultUsers.defaultUsersData) {
        let learnerWithLoginName = allUserResponse.users.find(
            (user) => user.loginName === obj.loginName
        );
        let dataForContentCompletion = []
        dataForContentCompletion.push({
            learner: learnerWithLoginName.id, content: "78a7b928-d25b-4c27-a3f7-31fb755a1c05", "type": "ADMIN",
            score: "",
            reason: "For testing",
            datetime: reusableFunctions.getPreviousDayFormattedDate(),
            duration: 3600
        })

        let conentCompletionApiResp = await conentCompletionApi(
            request,
            jwt,
            orgId,
            adminUserId,
            dataForContentCompletion
        );
        logger.info(conentCompletionApiResp);
    }
});


