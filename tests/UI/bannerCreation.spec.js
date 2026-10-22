import { test } from "@playwright/test";
import reusableFunctions from "../../helpers/UI/commonFunctions";
import { bannerCreation } from "../../pageObjects/bannerCreation";
import { loginLPUiPage } from "../../pageObjects/loginLPUiPage";
import { homePageAdmin } from "../../pageObjects/homePageAdmin";
import config from "config";
import { logger } from "../../logger.js";

let bannerCreationObj, loginLPUiPageObj, homePageObj;
let page;
let fileName = process.env.FileName;
let bannerDataFilepath = reusableFunctions.getPath(
  "testData/BannerData",
  `${fileName}.json`
);
let totalData =
  reusableFunctions.readDatafromJsonFilenotasync(bannerDataFilepath);
let bannerdata = totalData?.BannerData || [];

test.beforeAll("Creating Objects", async ({ browser }, testInfo) => {
  testInfo.setTimeout(200000);
  page = await browser.newPage();
  loginLPUiPageObj = new loginLPUiPage(page);
  bannerCreationObj = new bannerCreation(page);
  homePageObj = new homePageAdmin(page);
});

test.describe.parallel("Login and create Banner @createBanner", () => {
  test.beforeEach("Login", async ({}, testInfo) => {
    testInfo.setTimeout(100000);
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
    await homePageObj.switchRole("Admin");
    await bannerCreationObj.gotoContentPromotionPage();
  });

  for (let data of bannerdata) {
    test(`Banner ${data.BannerName}`, async ({}, testInfo) => {
      testInfo.setTimeout(600000);
      let shouldCreateBanner =
        !process.env.Locale || process.env.Locale === data.BannerLocale;
      if (shouldCreateBanner) {
        await bannerCreationObj.createNewBanner(
          data.BannerName,
          data.contentUUID,
          data.ContentType,
          data.BannerAudience,
          data.BannerLocale,
          data.BannerDuration
        );
      }
      await loginLPUiPageObj.logout();
      await reusableFunctions.setTimer(4000);
    });
  }
});

//if you pass All Users text. It will skip add audience code
