import { test } from "@playwright/test";
import { loginLPUiPage } from "../../pageObjects/loginLPUiPage";
import { homePageAdmin } from "../../pageObjects/homePageAdmin";
import { userManagement } from "../../pageObjects/userManagement";
import reusableFunctions from "../../helpers/UI/commonFunctions";
import config from "config";
import { logger } from "../../logger.js";


let loginLPUiPageObj, homePageAdminObj, userManagementObj;
let page;

test.beforeAll("Creating Objects", async ({ browser }) => {
  page = await browser.newPage();
  loginLPUiPageObj = new loginLPUiPage(page);
  homePageAdminObj = new homePageAdmin(page);
  userManagementObj = new userManagement(page);
});

const secondStepCases = async () => {
  await homePageAdminObj.clickUserButton();
  await homePageAdminObj.tapOnUserManagement();
};

test.describe("Admin", () => {
  test("Login", async ({}, testInfo) => {
    testInfo.setTimeout(15000);
    try {
      await loginLPUiPageObj.openBrowser();
    } catch (error) {
      logger.info(
        "Browser launch issue, might be VPN issue or environment issue"
      );
    }
    await loginLPUiPageObj.login(
      config.get("Admindata").loginID,
      config.get("Admindata").password
    );
  });

  test("check User on Home page or not by tapping on Library button", async () => {
    if (await loginLPUiPageObj.checkLibraryButton()) {
      await loginLPUiPageObj.validateHomePage();
    }
  });

  test("Tap on user dropdown and click on UserManagement", async () => {
    await secondStepCases();
  });

  test.skip("Create Bulk Users from UI", async ({ page }) => {
    await secondStepCases();
    await userManagementObj.validateBulkImportUILanding();
    const location =reusableFunctions.getPath(
      "testData",
      "template.csv"
    );
    await reusableFunctions.addElementTotargetElement(
      location,
      await userManagementObj.getlocatorofchooseAFile(),
      page
    );
    // await userManagementObj.selectFileButton.setInputFiles([location]);
    //await userManagementObj.clickImportButton();
  });
});
