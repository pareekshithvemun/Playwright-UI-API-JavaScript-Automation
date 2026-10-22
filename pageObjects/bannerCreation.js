import { expect } from "@playwright/test";
import reusableFunctions from "../helpers/UI/commonFunctions";
import { createuserdata } from "../helpers/API/response/createUserresponse.js";
import { logger } from "../logger.js";
import config from "config";

let url = config.get("Environment").baseURL;
export class bannerCreation {
  constructor(page) {
    this.page = page;
    this.mouse = page.mouse;

    // this.learningButton = page.locator(
    //   'li button[jf-ext-button-ct="learning"]'
    // );

    this.learningButton = page.locator('//div[text()="Learning"]');
    this.contentPromotion = page.locator('li[data-marker="contentPromotions"]');

    // this.dropdownofLearning = page.locator("#navbar-menu-LEARNING-menu");
    this.createNewPromotionButton = page.locator(
      '//span[contains(text(),"Create New Promotion")]',
    );
    this.createNewpromotionpopup = page.locator(
      "div.ReactModal__InsideContent",
    );
    this.createBannerButton = page.locator(
      'div button[data-marker="createBanner"]',
    );
    this.addBannerButton = page.locator('button[aria-label*="Add to banner"]');
    this.contentTypeTextElement = page.locator(
      'div[data-marker="ContentTypeDisplay"]',
    );
    this.bannerTitleInputField = page.locator('input[name="bannerTitleInput"]');
    this.getStartDate = page.locator('input[aria-label="Start date"]');
    this.getEndDate = page.locator('input[aria-label="End date"]');
    this.addContentButton = page.locator(
      '//span[contains(text(),"Add content")]',
    );
    this.addContetUIconfirmationText = page.locator(
      '[class*="ContentSearchModal---header"]',
    );
    this.inputFieldOfBannerContent = page.locator(
      'input[placeholder*="Search for content"]',
    );
    this.bannerSearchResults = page.locator('li[data-marker="ResultItem"]');
    this.searchResultText = page.locator('a[data-marker="titleLink"]');
    this.serachResultConfirmation = page.locator(
      '//span[contains(text(),"Filter by")]',
    );
    this.noBannerEndCheckBox = page.locator(
      '//span[contains(text(),"No end date")]',
    );
    this.addcontentToBannerButton = page.locator(
      'button[data-marker="addContentButton"]',
    );
    this.addAudienceButton = page.locator(
      '//span[contains(text(),"Add audiences")]',
    );
    this.audienceUIconfirmationText = page.locator(
      '//h2[contains(text(),"Search for audiences")]',
    );
    this.inputFieldOfAudience = page.locator(
      'div[class*="FieldContainer"] div input',
    );
    this.sendPromotionEmailcheckbox = page.locator(
      'div[data-marker="stripPromotionAudiences"] div[class*="Checkbox---inputCheckbox"]',
    );
    this.createpromotionButton = page.locator("#createUpdateBanner");
    this.audienceresultsparent = page.locator(
      'div[class*="ContainedItemsBuilder---resultsContainer"]',
    );
    this.audienceselectButton = page.locator(
      'div[data-marker="resultItem"] button[data-marker="resultItemSelect"]',
    );
    this.audienceFinalButton = page.locator('//span[contains(text(),"Done")]');
    this.bannercreationconfirmationDialog = page.locator(
      ".ReactModal__InsideContent",
    );
    this.closeconfirmationdialog = page.locator(
      '//span[contains(text(),"Got it")]',
    );
    this.languageDropdown = page.locator("select#locale");
  }

  async click(locator) {
    await locator.click();
  }

  async sendText(locator, text) {
    await locator.fill(text);
  }

  async waitAndClick(element) {
    await element.waitFor({ state: "visible", timeout: 18000 });
    await expect(element).toBeEnabled();
    await this.click(element);
  }

  async isElementVisible(timeout = 5000, element) {
    try {
      await element.waitFor({ state: "visible", timeout: timeout });
      return await element.isVisible();
    } catch (e) {
      return false;
    }
  }

  async clickOnLearningButton() {
    if (await this.isElementVisible(this.learningButton)) {
      await this.click(this.learningButton);
    } else {
      logger.info("Learning button is not visible");
    }
    if (await this.isElementVisible(this.contentPromotion)) {
      await this.waitAndClick(this.contentPromotion);
    } else {
      logger.info("contentPromotion button is not visible");
    }
  }

  async gotoContentPromotionPage() {
    await this.page.goto(url + "/admin/promoted-content");
    await reusableFunctions.setTimer(1000);
  }

  async selectLanguage(language) {
    await this.languageDropdown.selectOption({ label: language });
  }

  async selectEndDateForBanner(bannerExipry) {
    let startdate = await this.getStartDate.getAttribute("value");
    logger.info(`startdate:${startdate}`);
    let enddate = await reusableFunctions.adddaystoCurrentDateforUI(
      startdate,
      bannerExipry,
    );
    logger.info(`enddate:${enddate}`);
    // await this.waitAndClick(this.noBannerEndCheckBox);
    await this.sendText(this.getEndDate, enddate);
    await this.page.mouse.click(200, 200);
  }

  async scrollPage(deltaX, deltaY) {
    await this.mouse.wheel(deltaX, deltaY);
  }

  async addContentToBanner(bannerName, contentType) {
    let elementFoundOrNot = false;
    const maxRetries = 20; // Maximum scroll attempts (50 seconds max)
    let retryCount = 0;

    while (!elementFoundOrNot && retryCount < maxRetries) {
      let elements = await this.bannerSearchResults.all();
      for (let ele of elements) {
        let contentTypeEle = await ele.locator(this.contentTypeTextElement);
        let contentTypeText = await contentTypeEle.innerText();
        if (
          contentTypeText.trim().toLowerCase() ===
          contentType.trim().toLowerCase()
        ) {
          let contentText = await ele
            .locator(this.searchResultText)
            .innerText();
          logger.info(contentText);
          logger.info(bannerName);
          if (
            contentText.trim().toLowerCase() === bannerName.trim().toLowerCase()
          ) {
            await this.click(await ele.locator(this.addBannerButton));
            elementFoundOrNot = true;
            break;
          }
        }
      }

      if (!elementFoundOrNot) {
        await this.scrollPage(0, 250);
        await reusableFunctions.setTimer(1000);
        retryCount++;
      }
    }

    if (!elementFoundOrNot) {
      logger.error(
        `Could not find banner content "${bannerName}" of type "${contentType}" after ${maxRetries} scroll attempts`,
      );
    }
  }

  async createNewBanner(
    bannerName,
    BannerContent,
    contentType,
    AudienceName,
    bannerLocale,
    bannerExipry,
  ) {
    await this.waitAndClick(this.createNewPromotionButton);
    if (this.createNewpromotionpopup.isVisible()) {
      await this.waitAndClick(this.createBannerButton);
    }
    if (this.bannerTitleInputField.isVisible()) {
      await this.sendText(this.bannerTitleInputField, bannerName);
      await this.selectLanguage(bannerLocale);
      //await this.selectEndDateForBanner(bannerExipry);
      await this.waitAndClick(this.addContentButton);
    }
    if (this.addContetUIconfirmationText.isVisible()) {
      await this.sendText(this.inputFieldOfBannerContent, BannerContent);
      await this.page.keyboard.press("Enter");
      try {
        await expect(this.serachResultConfirmation).toBeVisible({
          timeout: 15000,
        });
      } catch (e) {
        logger.info("Search results took time to appear so it failed");
      }
      await this.addContentToBanner(bannerName, contentType);
      await this.waitAndClick(this.addcontentToBannerButton);
    }
    let dynamic = reusableFunctions.toogleDynamic();
    if (dynamic) {
      const dynamicAudName = createuserdata.getAudName();
      if (dynamicAudName) {
        AudienceName = dynamicAudName;
      }
    }

    if (AudienceName !== "All Users") {
      logger.info(`In banner section, cross checking audName${AudienceName}`);
      await expect(this.addAudienceButton).toBeVisible();
      await this.waitAndClick(this.addAudienceButton);
      await expect(this.audienceUIconfirmationText).toBeVisible();
      await this.sendText(this.inputFieldOfAudience, AudienceName);
      await this.page.keyboard.press("Enter");
      await reusableFunctions.setTimer(2000);
      await this.clickButtonForAudience(AudienceName);
      // await this.waitAndClick(this.audienceselectButton);
      await this.waitAndClick(this.audienceFinalButton);
    }
    await this.waitAndClick(this.sendPromotionEmailcheckbox);
    await this.waitAndClick(this.createpromotionButton);
    logger.info(
      `Created Banner with name ${bannerName} for audience ${AudienceName}`,
    );
    try {
      if (this.bannercreationconfirmationDialog.isVisible()) {
        await this.waitAndClick(this.closeconfirmationdialog);
        logger.info("It tapped on close button");
      }
    } catch (e) {
      logger.info("Confirmation dialog is not visibile this time");
    }
  }

  async clickButtonForAudience(audienceName) {
    let resultItems = await this.page.$$('div[data-marker="resultItem"]');

    for (let item of resultItems) {
      let title = await item.$('div[data-marker="title"]');
      if (title) {
        let titleText = await title.innerText();
        if (titleText.trim() === audienceName) {
          // Find and click the associated button
          let button = await item.$('button[data-marker="resultItemSelect"]');
          if (button) {
            await button.click();
            console.log(`Clicked on the button for ${audienceName}`);
          }
        }
      }
    }
  }
}
