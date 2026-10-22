import {
  test,
  ExcelHelperAndDataGenerator,
  reusableFunctions,
  generateToken,
  getAllUserApi,
  logger,
} from "../../../path.js";

let jwt;
let data;
let loginName;

test.beforeAll("Generate Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(20000);
  jwt = await generateToken(request);
  let userdata = new ExcelHelperAndDataGenerator();
  data = await reusableFunctions.testCreateUser(request, jwt, userdata, true);
  loginName = data[0].loginName;
});

test(`Get User UUID`, async ({ request }) => {
  try {
    let resp = await getAllUserApi(request, jwt);
    let data = resp.users.find((item) => item.loginName === loginName);
    let userUUID = data.id;
    await reusableFunctions.setUserUUIDOfAssignment(userUUID);
  } catch (e) {
    logger.info(`Unable to get uuid due to error:${e}`);
  }
});
