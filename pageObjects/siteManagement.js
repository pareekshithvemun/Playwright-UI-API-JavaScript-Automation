import { expect } from "@playwright/test";
import { logger } from "../logger.js";

export class siteManagement {
  constructor(page) {
    this.page = page;
    
    // Site Management page locators
    this.sitesHierarchy = page.locator('[data-marker="SitesHierarchy"]');
  }

  async click(locator) {
    await locator.click();
  }

  async verifySiteManagementPage() {
    // Wait for page to load
    await this.page.waitForLoadState("domcontentloaded");
    // Wait for Sites Hierarchy element to be visible
    await this.sitesHierarchy.waitFor({ state: "visible", timeout: 15000 });
    await expect(this.sitesHierarchy).toBeVisible();
    logger.info("User is on Site Management page");
    return true;
  }

  async clickGoToSite(siteName) {
    // Use exact match pattern: GoToSite-{siteName}-{number} to avoid matching similar names
    // e.g., platformeval1 should not match platformeval10 or platformeval11
    const goToSiteLink = this.page.locator(`a[data-marker^="GoToSite-${siteName}-"]`);
    await goToSiteLink.waitFor({ state: "visible", timeout: 10000 });
    // Scroll into view before clicking to ensure element is in viewport
    await goToSiteLink.scrollIntoViewIfNeeded();
    
    // Click and wait for navigation to child site URL
    await Promise.all([
      this.page.waitForURL(`**/${siteName}.percipio.com/**`, { timeout: 30000 }),
      this.click(goToSiteLink)
    ]);
    
    // Wait for auto-login redirect to complete (if it occurs)
    await this.page.waitForFunction(
      () => !window.location.href.includes('auto-login'),
      { timeout: 30000 }
    );
    
    // Wait for page to fully load after navigation/redirect
    await this.page.waitForLoadState("load");
    logger.info(`Clicked Go to site for: ${siteName}`);
  }
}
