import { expect } from "@playwright/test";
import { logger } from "../logger.js";

export class homePageAdmin {
  constructor(page) {
    this.page = page;
    this.LibraryButton = page.locator('//span[contains(text(),"Library")]');
    // Use specific data-marker or id to avoid matching other buttons containing "Users" text
    this.UsersButton = page.locator('button#userMainMenu, button[data-marker="userMainMenuMenuOption"]');
    this.UserDropDown = page.locator('ul[class*="BaseMenu---subMenu"]');
    this.ContentButton = page.locator('//span[contains(text(),"Content")]');
    this.contentDropDown = page.locator("navbar-menu-Content-menu");
    // Use specific data-marker to target the User Management link in the dropdown menu
    this.UserManagement = page.locator('a[data-marker="users"][href="/admin/users"]');
    this.admin = page.locator("button[data-marker='switchToAdminMenuButton']");
    this.learner = page.locator(
      "button[data-marker='switchToLearnerMenuButton']"
    );
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

  async ensureAdminView() {
    // Wait for page to be ready
    await this.page.waitForLoadState("domcontentloaded");
    
    // Check if "Switch to Admin" button is visible (meaning we're in Learner view)
    const isInLearnerView = await this.isElementVisible(this.admin, 5000);
    
    if (isInLearnerView) {
      logger.info("Currently in Learner view, switching to Admin view...");
      await this.waitAndClick(this.admin);
      // Wait for admin view to load
      await this.page.waitForLoadState("domcontentloaded");
      // Wait a bit for the UI to update after role switch
      await this.page.waitForTimeout(2000);
      logger.info("Successfully switched to Admin view");
    } else {
      logger.info("Already in Admin view");
    }
  }

  async clickUserButton() {
    // Wait for page to be ready and Users button to be visible
    await this.page.waitForLoadState("domcontentloaded");
    
    // First ensure we're in Admin view
    await this.ensureAdminView();
    
    await this.UsersButton.waitFor({ state: "visible", timeout: 15000 });
    await this.click(this.UsersButton);
    logger.info("Clicked Users button");
  }

  async tapOnUserManagement() {
    // Wait for dropdown menu to appear after clicking Users button
    await this.UserDropDown.waitFor({ state: "visible", timeout: 10000 });
    // Wait for User Management link to be visible and click
    await this.UserManagement.waitFor({ state: "visible", timeout: 10000 });
    await this.click(this.UserManagement);
    // Wait for User Management page to load
    await this.page.waitForLoadState("domcontentloaded");
    logger.info("Clicked User Management link");
  }

  async checkCurrentRole() {
    const isAdminVisible = await this.isElementVisible(this.admin, 10000);
    const isLearnerVisible = await this.isElementVisible(this.learner, 10000);
    if (isAdminVisible) {
      return "Learner";
    } else if (isLearnerVisible) {
      return "Admin";
    } else {
      logger.error("No role button is visible");
    }
  }

  async switchRole(role) {
    const currentRole = await this.checkCurrentRole();
    logger.info(`Current Role: ${currentRole}, Target Role: ${role}`);

    if (role === "Learner" && currentRole !== role) {
      logger.info(`Switching to Role: ${role}`);
      await this.waitAndClick(this.learner);
      logger.info("Switched to Learner");
    } else if (role === "Admin" && currentRole !== role) {
      logger.info(`Switching to Role: ${role}`);
      await this.waitAndClick(this.admin);
      logger.info("Switched to Admin");
    } else {
      logger.info(`Already in required role: ${role}. No action needed.`);
    }
  }
}
