import { expect } from "@playwright/test";
import { logger } from "../logger.js";

export class userManagement {
  constructor(page) {
    this.page = page;
    
    // User Management page locators
    this.userManagementTitle = page.locator('//span[contains(text(),"User Management")]');
    this.bulkIMportButton = page.locator('//span[contains(text(),"Bulk Import Users")]');
    this.chooseAFile = page.locator("div#DropZone");
    this.selectFileButton = page.locator('//span[contains(text(),"Select a file")]');
    this.importButton = page.locator('div#DropZone button[data-coga-action="submit"]');
    this.createUserButton = page.locator('//span[contains(text(),"Create User")]');
    
    // Search input
    this.userSearchInput = page.locator('input#search');
    
    // Actions button in user row
    this.actionsButton = page.locator('button[data-marker="Actions"]');
    
    // Actions dropdown menu
    this.actionsMenu = page.locator('div[role="menu"][aria-label*="Actions menu"]');
    
    // Edit User dropdown option
    this.editUserOption = page.locator('a[data-coga-action="edit"]');
    
    // Edit User Form locators - Using "User details" heading which is unique to the Edit User page
    this.editUserTitle = page.locator('h2:has-text("User details")');
    this.passwordInput = page.locator('input[type="password"]');
    
    // LX Design Studio checkboxes - target the checkbox input, not just the label span
    this.accessToLXDesignStudioLabel = page.locator('//span[contains(text(),"Access to LX Design Studio")]');
    this.accessToLXDesignStudioCheckbox = page.locator('//span[contains(text(),"Access to LX Design Studio")]/ancestor::label//input[@type="checkbox"]');
    this.publishContentLabel = page.locator('//span[contains(text(),"Publish content from LX Design Studio")]');
    this.publishContentCheckbox = page.locator('//span[contains(text(),"Publish content from LX Design Studio")]/ancestor::label//input[@type="checkbox"]');
    
    // Update button
    this.updateButton = page.locator('//span[contains(text(),"Update")]');
  }

  async click(locator) {
    await locator.click();
  }

  async waitAndClick(element) {
    await element.waitFor({ state: "visible", timeout: 10000 });
    await expect(element).toBeEnabled();
    await this.click(element);
  }

  async isElementVisible(element, timeout = 5000) {
    try {
      await element.waitFor({ state: "visible", timeout: timeout });
      return await element.isVisible();
    } catch (e) {
      return false;
    }
  }

  async getlocatorofchooseAFile() {
    return this.chooseAFile;
  }

  async searchUser(searchTerm) {
    await this.userSearchInput.waitFor({ state: "visible", timeout: 10000 });
    await this.userSearchInput.fill(searchTerm);
    await this.page.keyboard.press("Enter");
    // Wait for search results to be displayed (Actions button indicates user row is present)
    await this.actionsButton.first().waitFor({ state: "visible", timeout: 15000 });
    logger.info(`Searched for user: ${searchTerm}`);
  }

  async clickActionsButtonForUser(userName) {
    // Scope the Actions button to the specific user's row
    const userRowActionsBtn = this.page.locator(`//div[contains(text(),"${userName}")]/ancestor::div[@role="row"]`).locator(this.actionsButton);
    await userRowActionsBtn.waitFor({ state: "visible", timeout: 10000 });
    await this.click(userRowActionsBtn);
    logger.info(`Clicked actions button for user: ${userName}`);
  }

  async clickEditUser() {
    // Wait for actions dropdown menu to be visible
    await this.actionsMenu.waitFor({ state: "visible", timeout: 5000 });
    logger.info("Actions menu is visible");
    // Click Edit User option
    await this.editUserOption.waitFor({ state: "visible", timeout: 5000 });
    await this.click(this.editUserOption);
    // Wait for Edit User page to load by checking for "User details" heading
    await this.editUserTitle.waitFor({ state: "visible", timeout: 10000 });
    logger.info("Clicked Edit User option and Edit User page loaded (User details section visible)");
  }

  async enterPassword(password) {
    await this.passwordInput.waitFor({ state: "visible", timeout: 10000 });
    await this.passwordInput.fill(password);
    logger.info("Entered password");
  }

  async isCheckboxChecked(checkboxLocator) {
    try {
      // Try to get checked state from the input element
      const isChecked = await checkboxLocator.isChecked();
      return isChecked;
    } catch (e) {
      // If input not found, try to check aria-checked attribute on parent
      return false;
    }
  }

  async enableAccessToLXDesignStudio() {
    await this.accessToLXDesignStudioLabel.scrollIntoViewIfNeeded();
    
    // Check if already enabled
    const isAlreadyChecked = await this.isCheckboxChecked(this.accessToLXDesignStudioCheckbox);
    
    if (isAlreadyChecked) {
      logger.info("Access to LX Design Studio is already enabled, skipping");
      return;
    }
    
    await this.click(this.accessToLXDesignStudioLabel);
    logger.info("Enabled Access to LX Design Studio");
  }

  async enablePublishContentFromLXDesignStudio() {
    await this.publishContentLabel.scrollIntoViewIfNeeded();
    
    // Check if already enabled
    const isAlreadyChecked = await this.isCheckboxChecked(this.publishContentCheckbox);
    
    if (isAlreadyChecked) {
      logger.info("Publish content from LX Design Studio is already enabled, skipping");
      return;
    }
    
    // Wait for the checkbox to be enabled (it depends on "Access to LX Design Studio" being checked)
    await this.publishContentLabel.waitFor({ state: "visible", timeout: 5000 });
    await this.click(this.publishContentLabel);
    logger.info("Enabled Publish content from LX Design Studio");
  }

  async clickUpdateButton() {
    await this.updateButton.scrollIntoViewIfNeeded();
    await this.waitAndClick(this.updateButton);
    await this.page.waitForTimeout(2000);
    logger.info("Clicked Update button");
  }

  async validateBulkImportUILanding() {
    await expect(this.userManagementTitle).toBeVisible();
    await this.click(this.bulkIMportButton);
    await expect(this.selectFileButton).toBeVisible();
  }

  async clickImportButton() {
    await this.page.waitForTimeout(1000);
    if (await this.importButton.isDisabled()) {
      logger.info("Still button is not enabled");
      await this.click(this.importButton);
    } else {
      await this.click(this.importButton);
      logger.info("button is enabled");
    }
  }
}
