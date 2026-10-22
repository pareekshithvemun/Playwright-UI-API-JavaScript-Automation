import {
  test,
  config,
  logger,
  reusableFunctions,
  generateToken,
  getjourneyId,
  loginLPUiPage,
  homePageAdmin,
  bannerCreation,
} from "../../path.js";

// Journey names to create banners for
const JOURNEY_NAMES = [
  "Percipio Page Builder Journey",
  "Percipio LX Design Studio Guided Experience",
];

// Banner configuration
const BANNER_CONFIG = {
  audienceName: "evalAudience",
  bannerLocale: "English (US)",
  bannerDuration: 30,
  contentType: "Aspire Journey",
};

// Running serially ensures banners appear in the same order they're created in the code.
// In the UI, "last created" appears on top. Running tests one after another maintains
// the expected order in the UI that matches our test sequence.
test.describe.serial("Banner Creation for Child Sites", () => {
  for (let journeyName of JOURNEY_NAMES) {
    test(`Banner: ${journeyName}`, async ({ browser, request }) => {
      test.setTimeout(600000);

      // Fetch journey UUID using optimized server-side search
      let jwt = await generateToken(request);
      let contentUUID = await getjourneyId(request, jwt, journeyName);

      if (!contentUUID) {
        logger.info(`Journey not found or not published: ${journeyName}`);
        return;
      }

      logger.info(`Found journey: ${journeyName} -> ${contentUUID}`);

      // Create new page for this test
      let page = await browser.newPage();
      let loginLPUiPageObj = new loginLPUiPage(page);
      let bannerCreationObj = new bannerCreation(page);
      let homePageObj = new homePageAdmin(page);

      try {
        // Login
        await loginLPUiPageObj.openBrowser();
        await loginLPUiPageObj.login(
          config.get("Admindata").loginID,
          config.get("Admindata").password,
        );
        await homePageObj.switchRole("Admin");
        await bannerCreationObj.gotoContentPromotionPage();

        // Create banner
        logger.info(`Creating banner for: ${journeyName}`);
        await bannerCreationObj.createNewBanner(
          journeyName,
          contentUUID,
          BANNER_CONFIG.contentType,
          BANNER_CONFIG.audienceName,
          BANNER_CONFIG.bannerLocale,
          BANNER_CONFIG.bannerDuration,
        );

        await loginLPUiPageObj.logout();
        await reusableFunctions.setTimer(3000);
      } finally {
        await page.close();
      }
    });
  }
});
