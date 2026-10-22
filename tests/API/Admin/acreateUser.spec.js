import {
  test,
  ExcelHelperAndDataGenerator,
  reusableFunctions,
  generateToken,
  logger,
} from "../../../path.js";

let jwt;
let excelData;

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
  logger.info(jwt);
  logger.info(process.env.NODE_ENV);
});

test.describe("Create Users and Audience Manager @stripcreation @cucc @createBanner @createassignment @areaCreation @topwords @usercreation @benchmarkData", () => {
  test("Multi User Creation @playList", async ({ request }) => {
    test.setTimeout(1000000);
    let userdata = new ExcelHelperAndDataGenerator();
    excelData = await reusableFunctions.testCreateUser(request, jwt, userdata);
  });
});
