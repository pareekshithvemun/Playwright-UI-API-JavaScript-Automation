import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { addUserProfileApi } from "../../../helpers/API/apibuilders/addUserProfileApi.js";

test("Edit user profile for default Users", async ({ request },testInfo) => {
  testInfo.setTimeout(500000);
  let pathofuserData = "testData/usersData/defaultUsers.json";
  let defaultUsers =
    reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
  for (let element of defaultUsers.defaultUsersData) {
    if (element.ProfilePicture) {
      let userToken = await generateTokenLearner(
        request,
        element.loginName,
        element.passWord
      );
      await addUserProfileApi(
        request,
        userToken,
        element.ProfilePicture,
        element.loginName
      );
    }
  }
});
