const { expect } = require("@playwright/test");
import config from "config";
let url = config.get("Environment").baseURL;
import { logger } from "../logger.js";

export class certitudePage {
  constructor(page) {
    this.page = page;
    this.filepickerDropzone = "div.filepicker.dropzone";
    this.fileInput = page.locator('input[type="file"]');
    this.editDetailsButton = 'a[data-marker="editDetails"]';
    this.digitalBadgeCheckbox =
      "//span[contains(text(), 'Allow learners to earn a Digital Badge for this course')]";
    this.addDiscoveryInfoButton = "#nextAddContentBtn";
    this.titleField = "#title";
    this.minField = "#minutesfield";
    this.source = "#sourceName";
    this.reviewAndFinalizeButton =
      "//span[contains(text(),'Next: Review and finalize')]";
    this.publishContentButton =
      "//span[contains(text(),'Next: Publish content')]";
    this.publishButton = "button[data-marker='publishbtn']";
    this.sucessMessage = "div[data-marker='successMessage']";
    this.iframeLocator = page.frameLocator("iframe#description_ifr"); // Adjust selector if necessary
    this.descriptionField = page.locator('[aria-label="Description"]');
  }

  async clickandWait(locator, waitTime = 4000) {
    await this.page.locator(locator).click();
    await this.page.waitForTimeout(waitTime);
  }

  async openCertitudeCreationPage() {
    if (url) {
      await this.page.goto(`${url}/admin/linked-content/upload/PACKAGE`);
    }
  }

  async fillMin(min) {
    await this.page.locator(this.minField).fill(min);
    await this.page.waitForTimeout(3000);
  }

  async uploadAndPublishContent(filepath, title, description) {
    await this.page.waitForSelector(this.filepickerDropzone, {
      state: "visible",
      timeout: 30000,
    });
    await this.fileInput.setInputFiles(filepath);
    await this.page.waitForSelector(this.editDetailsButton, {
      state: "visible",
      timeout: 30000,
    });
    await this.clickandWait(this.editDetailsButton);
    await this.page.waitForSelector(this.titleField, {
      state: "visible",
      timeout: 30000,
    });
    await this.page.locator(this.titleField).fill(title);
    await this.descriptionField.fill(description);
    await this.clickandWait(this.digitalBadgeCheckbox);
    await this.clickandWait(this.addDiscoveryInfoButton);
    await this.page.locator(this.source).fill("Skillsoft");
    await this.fillMin("2");
    await this.clickandWait(this.reviewAndFinalizeButton);
    await this.clickandWait(this.publishContentButton);
    await this.clickandWait(this.publishButton);
    await this.page.waitForSelector(this.sucessMessage, {
      state: "visible",
      timeout: 30000,
    });
    logger.info(`${title} has been published`);
    await this.page.close();
  }
}
