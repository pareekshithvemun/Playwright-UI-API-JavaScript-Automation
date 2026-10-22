import { expect } from "@playwright/test";
import reusableFunctions from "../helpers/UI/commonFunctions";
import { USAUrls } from "../testData/contentConfig/USAurls.js";
import config from "config";
import { logger } from "../logger.js";

// Centralized timeout constants
const TIMEOUTS = {
  SHORT: 8000,
  MEDIUM: 9000,
  LONG: 10000,
  EXTRA_LONG: 15000,
  LOGIN: 60000,
  CONTENT_CONFIG: 70000,
  /** Journey embed: player vs completion container race under parallel WebKit/Jenkins */
  JOURNEY_PLAYER_AND_STATUS: 60000,
};

export class loginLPUiPage {
  constructor(page) {
    this.page = page;
    this.url = config.get("Environment").baseURL;

    // Login elements
    this.userId = page.locator("#loginName");
    this.nextButton = page.locator('//span[contains(text(),"Next")]');
    this.password = page.locator("#password");
    this.loginButton = page.locator('//span[contains(text(),"Log in")]');

    // Navigation elements
    this.LibraryButton = page.locator("#library-Button");
    this.userProfile = page.locator('div[class*="ProfilePicture"]');
    this.profileDropdown = page.locator('div[class*="NavMenu---expanded"]');
    this.logoutButton = page.locator('a[aria-label*="Log Out"]');

    // Intro/Welcome screen elements
    this.maybeLaterButton = page.getByText("Maybe Later");
    // exact: true keeps Pendo's "Maybe later" tour button from matching; .first() guards strict mode.
    this.onboardingMaybeLaterButton = page
      .locator('button[data-marker="onboardingJobRolesMaybeLater"]')
      .or(page.getByRole("button", { name: "Maybe Later", exact: true }))
      .first();
    this.welcomePopup = page.getByText("Welcome to Percipio!");
    this.noThanksButton = page.getByRole("button", { name: "No, thanks" });
    this.personalizeIntroScreen = page.getByText(
      "Help us personalize your learning experience",
    );

    // Modal/Popup elements
    this.acceptButton = page.locator('//span[text()="Accept policy"]');
    this.closeModalButton = page.locator('[data-marker="closeModal"]');
    this.closePopup = page.locator('button[aria-label="Close"]');

    // Content Config elements
    this.iframeLocator = page.frameLocator("iframe#nativeContentConfigIframe");
    this.contentConfigConformationText = this.iframeLocator.locator(
      "h2.pageHeader-title",
    );

    // Video/Journey elements — do not chain .or(bigPlay, controlBar): both can exist → strict mode violation
    this.videoTitle = page.locator('a[data-marker="titleLink"]');
    this.journeyBigPlay = page.locator("button.vjs-big-play-button").first();
    this.journeyPlayControl = page.locator(".vjs-play-control").first();
    this.licenseAgreement = page.locator("a#licenseAgreement");
    this.statusOfJourneyText = page.locator(
      'div[data-marker="completionContainer"]',
    );

    // Certificate upload elements
    this.uploadCertificateButton = page.locator(
      '[data-marker="uploadCertification"]',
    );
    this.issuingbodyDropdown = page.locator("#select-field-placeholder");
    this.vendor = page.locator("text=AWS");
    this.toggleUploadpdf = page.locator('button[aria-labelledby="showPdf"]');
    this.fileInput = page.locator('input[type="file"]');
    this.addCertificateButton = page.locator('span:text("Add")');
    this.issueDate = page.locator(
      'input[data-marker="certificationIssueDate"]',
    );
    this.expiryDate = page.locator(
      'input[data-marker="certificationExpiryDate"]',
    );
    this.saveBtn = page.locator('span:text("Save")');
    this.confirmReceipentCheckbox = page.locator(
      '//span[contains(text(), "you are confirming you are the recipient")]',
    );

    // Study Group elements
    this.joinStudyGroupButton = page.locator(
      '//button/span[contains(text(),"Join")][1]',
    );
    this.confirmToJoinStudyGroupButton = page.locator(
      '//button/span[contains(text(),"Yes, join")]',
    );
  }

  // Enhanced click with timeout support
  async click(locator, timeout = TIMEOUTS.MEDIUM) {
    await locator.click({ timeout });
  }

  // Navigate to base URL
  async openBrowser() {
    if (this.url) {
      try {
        await this.page.goto(this.url, {
          waitUntil: "domcontentloaded",
          timeout: TIMEOUTS.LONG,
        });
        logger.info(`Navigated to ${this.url}`);
      } catch (error) {
        logger.error(`Failed to open browser at ${this.url}: ${error.message}`);
        throw error;
      }
    } else {
      throw new Error("Base URL is not configured");
    }
  }

  // Login with retry logic for reliability
  async login(username, password, maxRetries = 2) {
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(
          `Login attempt ${attempt}/${maxRetries} for user: ${username}`,
        );

        // Fill username and proceed
        await this.userId.waitFor({
          state: "visible",
          timeout: TIMEOUTS.LOGIN,
        });
        await this.userId.fill(username, { timeout: TIMEOUTS.EXTRA_LONG });
        await this.click(this.nextButton, TIMEOUTS.EXTRA_LONG);

        // Fill password and login
        await this.password.waitFor({
          state: "visible",
          timeout: TIMEOUTS.LOGIN,
        });
        await this.password.fill(password, { timeout: TIMEOUTS.EXTRA_LONG });
        await this.click(this.loginButton, TIMEOUTS.EXTRA_LONG);

        // Wait for navigation to complete
        await this.page.waitForLoadState("domcontentloaded", {
          timeout: TIMEOUTS.LONG,
        });

        // Handle post-login popups
        await this.handlePostLoginPopups();

        // Handle any delayed redirect to onboarding and ensure user lands on homepage
        await this.handlePostLoginRedirect();

        logger.info(`Successfully logged in as ${username}`);
        return true;
      } catch (error) {
        lastError = error;
        logger.warn(
          `Login attempt ${attempt} failed for ${username}: ${error.message}`,
        );

        if (attempt < maxRetries) {
          logger.info(`Retrying login in 2 seconds...`);
          await this.page.waitForTimeout(2000);
        }
      }
    }

    logger.error(
      `All login attempts failed for ${username}: ${lastError.message}`,
    );
    throw lastError;
  }

  // Handle post-login popups (Accept policy, Close modals)
  async handlePostLoginPopups() {
    // Handle Accept Policy button
    try {
      const acceptVisible = await this.acceptButton.isVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      if (acceptVisible) {
        await this.acceptButton.scrollIntoViewIfNeeded({
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.acceptButton.click({ timeout: TIMEOUTS.MEDIUM });
        logger.info("Accepted policy popup");
      }
    } catch (error) {
      logger.info("Accept policy button not found - skipping");
    }

    // Handle Close Modal button
    try {
      const modalVisible = await this.closeModalButton.isVisible({
        timeout: TIMEOUTS.SHORT,
      });
      if (modalVisible) {
        await this.closeModalButton.click({ timeout: TIMEOUTS.SHORT });
        logger.info("Closed modal popup");
      }
    } catch (error) {
      logger.info("Close modal button not found - skipping");
    }
  }

  // Handle post-login redirect - platform may briefly show homepage then redirect to onboarding
  // Polls multiple times to catch delayed redirect before proceeding
  async handlePostLoginRedirect() {
    logger.info("Checking for post-login redirect...");

    // Wait for page to stabilize - platform may redirect to onboarding after brief homepage flash
    // Check multiple times (20 attempts x 500ms = 10s total) to catch delayed redirect
    for (let attempt = 1; attempt <= 12; attempt++) {
      // Small delay between checks to allow page/redirect to settle
      await reusableFunctions.setTimer(5000);

      // Check if we're on onboarding page
      const currentUrl = this.page.url();
      if (currentUrl.includes("/onboarding")) {
        logger.info(
          `Attempt ${attempt}: On onboarding page — clicking Maybe Later`,
        );
        await this._handleOnboardingMaybeLater();
        return;
      }

      // Check if Maybe Later button is visible (onboarding page loaded)
      const maybeLaterVisible = await this.onboardingMaybeLaterButton
        .isVisible()
        .catch(() => false);
      if (maybeLaterVisible) {
        logger.info(
          `Attempt ${attempt}: Maybe Later button visible — handling onboarding`,
        );
        await this._handleOnboardingMaybeLater();
        return;
      }

      // Log every 5th attempt to show progress without flooding logs
      if (attempt % 5 === 0) {
        logger.info(
          `Attempt ${attempt}: No redirect detected, still checking...`,
        );
      }
    }

    logger.info("No redirect detected — user on homepage");
  }

  // Helper: Handle Maybe Later button on onboarding page
  async _handleOnboardingMaybeLater() {
    try {
      // Wait for page to fully load first
      await this.page.waitForLoadState("domcontentloaded", {
        timeout: TIMEOUTS.LONG,
      });
      await this.page
        .waitForLoadState("networkidle", { timeout: TIMEOUTS.LONG })
        .catch(() => {});

      // Wait for button to be visible
      await this.onboardingMaybeLaterButton.waitFor({
        state: "visible",
        timeout: TIMEOUTS.EXTRA_LONG,
      });

      // Scroll into view before clicking
      await this.onboardingMaybeLaterButton.scrollIntoViewIfNeeded({
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.onboardingMaybeLaterButton.click({ timeout: TIMEOUTS.MEDIUM });

      // Wait for navigation away from onboarding
      await this.page
        .waitForURL((url) => !url.toString().includes("/onboarding"), {
          timeout: TIMEOUTS.LONG,
        })
        .catch(() => {
          logger.info("URL may have changed; continuing.");
        });

      await this.page.waitForLoadState("domcontentloaded", {
        timeout: TIMEOUTS.MEDIUM,
      });

      logger.info("Onboarding handled — homepage ready");
    } catch (error) {
      logger.warn(`_handleOnboardingMaybeLater: ${error.message}`);
    }
  }

  // Logout from application
  async logout() {
    try {
      await this.click(this.userProfile);

      const dropdownVisible = await this.profileDropdown.isVisible({
        timeout: TIMEOUTS.SHORT,
      });
      if (dropdownVisible) {
        await this.waitAndClick(this.logoutButton);
        logger.info("User logged out successfully");
      } else {
        logger.warn("Profile dropdown not visible during logout");
      }
    } catch (error) {
      logger.error(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  // Wait for element visibility and click
  async waitAndClick(element) {
    await element.waitFor({ state: "visible", timeout: TIMEOUTS.SHORT });
    await expect(element).toBeEnabled();
    await this.click(element);
  }

  // Validate home page by checking Library button
  async validateHomePage() {
    try {
      await expect(this.LibraryButton).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.LibraryButton.click(); // Open dropdown
      await this.LibraryButton.click(); // Close dropdown
      logger.info("Home page validated successfully");
    } catch (error) {
      logger.error(`Home page validation failed: ${error.message}`);
      throw error;
    }
  }

  // Check if user is new or returning based on Library button visibility
  async checkLibraryButton() {
    try {
      await this.page.waitForTimeout(4000); // Wait to handle app bug showing home page briefly for new users

      const isVisible = await this.LibraryButton.isVisible({
        timeout: TIMEOUTS.SHORT,
      });
      if (isVisible) {
        logger.info("Old user detected");
        return true;
      } else {
        logger.info("New user detected");
        return false;
      }
    } catch (error) {
      logger.error(`Error checking user type: ${error.message}`);
      return false;
    }
  }

  // Skip intro/welcome screens for new users
  async skipIntroScreen() {
    try {
      // Wait for page to fully stabilize after login with multiple load states
      logger.info("⏳ Waiting for page to load after login...");
      await this.page.waitForLoadState("load", { timeout: 30000 }); // Wait for full load
      await this.page
        .waitForLoadState("networkidle", { timeout: 30000 })
        .catch(() => {
          logger.info("Network not idle, but continuing...");
        });

      // Give extra time for React/Angular to render
      await this.page.waitForTimeout(8000);

      // Handle welcome popup if present
      try {
        const welcomeVisible = await this.welcomePopup.isVisible({
          timeout: TIMEOUTS.SHORT,
        });
        if (welcomeVisible) {
          await this.handleWelcomePopup();
          await this.page.waitForTimeout(2000);
          logger.info("✅ Handled welcome popup");
        }
      } catch (e) {
        // Welcome popup not present, continue
      }

      // Check for login indicators with much longer timeout
      logger.info("🔍 Checking for post-login elements...");

      let foundElement = false;
      let elementName = "";

      // Try each element with individual checks
      try {
        const maybeLaterVisible = await this.maybeLaterButton.isVisible({
          timeout: 15000,
        });
        if (maybeLaterVisible) {
          foundElement = true;
          elementName = "Maybe Later button";
          logger.info("✅ Found Maybe Later button");

          // Click it if personalize screen is shown
          const personalizeVisible = await this.personalizeIntroScreen
            .isVisible({
              timeout: 3000,
            })
            .catch(() => false);

          if (personalizeVisible) {
            await this.maybeLaterButton.click({ timeout: TIMEOUTS.MEDIUM });
            logger.info("✅ Clicked Maybe Later - skipped personalize screen");
            await this.page.waitForTimeout(2000);
          }
        }
      } catch (e) {
        // Maybe Later not found
      }

      if (!foundElement) {
        try {
          const libraryVisible = await this.LibraryButton.isVisible({
            timeout: 15000,
          });
          if (libraryVisible) {
            foundElement = true;
            elementName = "Library button";
            logger.info("✅ Found Library button");
          }
        } catch (e) {
          // Library button not found
        }
      }

      if (!foundElement) {
        try {
          const personalizeVisible =
            await this.personalizeIntroScreen.isVisible({
              timeout: 10000,
            });
          if (personalizeVisible) {
            foundElement = true;
            elementName = "Personalize screen";
            logger.info("✅ Found Personalize intro screen");
          }
        } catch (e) {
          // Personalize screen not found
        }
      }

      if (foundElement) {
        logger.info(`✅ Login verification successful - found ${elementName}`);

        // Handle any additional post-login popups
        try {
          await this.handlePostLoginPopups();
        } catch (e) {
          logger.info("No additional popups to handle");
        }
      } else {
        logger.error("⚠️ None of the expected post-login elements found");

        // Last resort - check if we're on home page by checking URL
        const currentUrl = this.page.url();

        if (
          currentUrl.includes("/home") ||
          currentUrl.includes("/discover") ||
          currentUrl === this.url + "/"
        ) {
          logger.info("✅ URL indicates successful login - continuing anyway");
        } else {
          logger.error("❌ Login verification failed - unexpected page state");
          throw new Error(
            "Post-login verification failed - expected elements not found and URL doesn't indicate home page",
          );
        }
      }
    } catch (error) {
      logger.error(`❌ Skip intro screen failed: ${error.message}`);
      throw error;
    }
  }

  // Handle welcome popup using locator handler
  async handleWelcomePopup() {
    await this.page.addLocatorHandler(this.welcomePopup, async () => {
      await this.noThanksButton.click();
      logger.info("Dismissed welcome popup");
    });
  }

  // Navigate to Content Config page and retrieve JWT token
  async gotoContentConfigPage(username, password, maxRetries = 10) {
    logger.info("Started fetching token to create content config");

    const contentConfigUrl = USAUrls.includes(this.url)
      ? "https://use1-prod-compliance-content-config-tool.percipio.com"
      : "https://euc1-prod-compliance-content-config-tool.percipio.com";

    try {
      // Navigate to native content configuration
      await this.page.goto(`${this.url}/admin/nativeContentConfiguration`, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUTS.LONG,
      });

      await this.login(username, password);

      // Wait for content config iframe to load
      await this.contentConfigConformationText.waitFor({
        state: "visible",
        timeout: TIMEOUTS.CONTENT_CONFIG,
      });

      logger.info(`Using contentConfigUrl: ${contentConfigUrl}`);

      // Navigate to external compliance tool (can be slow across regions)
      await this.page.goto(contentConfigUrl, {
        waitUntil: "load",
        timeout: TIMEOUTS.CONTENT_CONFIG,
      });
      logger.info("Reached content config page");

      // Retrieve JWT token from localStorage with retries
      const jwtToken = await this.retrieveJWTToken(maxRetries);

      if (!jwtToken) {
        logger.warn(`Failed to retrieve token after ${maxRetries} attempts`);
        return null;
      }

      logger.info(`Successfully retrieved token`);
      return jwtToken;
    } catch (error) {
      logger.error(
        `Failed to navigate to content config page: ${error.message}`,
      );
      throw error;
    }
  }

  // Retrieve JWT token from localStorage with retry logic
  async retrieveJWTToken(maxRetries) {
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        retryCount++;

        const jwtToken = await this.page.evaluate(() => {
          try {
            const persistUser = localStorage.getItem("persist:user");
            if (!persistUser) return null;

            const parsedData = JSON.parse(persistUser);
            if (!parsedData.jwt) return null;

            return JSON.parse(parsedData.jwt);
          } catch (error) {
            return null;
          }
        });

        if (jwtToken) {
          logger.info(`Token retrieved on attempt ${retryCount}`);
          return jwtToken;
        }

        logger.info(
          `Attempt ${retryCount}/${maxRetries}: Token not found, retrying...`,
        );
        await this.page.waitForTimeout(900);
      } catch (error) {
        logger.error(
          `Error retrieving token on attempt ${retryCount}: ${error.message}`,
        );
      }
    }

    return null;
  }

  // Click on video in a journey and watch it
  async clickOnVideo(journeyUuid, userLogin, password = "P@ssw0rd123@") {
    try {
      await this.page.setViewportSize({ width: 720, height: 1280 });

      // Navigate to journey with extended timeout for parallel execution
      await this.page.goto(`${this.url}/journey/${journeyUuid}`, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUTS.LOGIN,
      });

      await this.login(userLogin, password);

      // Scroll to license agreement with retry logic for parallel execution
      let scrollAttempts = 0;
      const maxScrollAttempts = 3;
      while (scrollAttempts < maxScrollAttempts) {
        try {
          await this.page.waitForTimeout(1000); // Wait for DOM to stabilize
          await this.licenseAgreement.scrollIntoViewIfNeeded({
            timeout: TIMEOUTS.EXTRA_LONG,
          });
          break; // Success, exit retry loop
        } catch (error) {
          scrollAttempts++;
          if (scrollAttempts >= maxScrollAttempts) {
            logger.error(
              `Failed to scroll to license agreement after ${maxScrollAttempts} attempts: ${error.message}`,
            );
            throw error;
          }
          logger.warn(
            `Scroll attempt ${scrollAttempts} failed, retrying... (${error.message})`,
          );
          await this.page.waitForTimeout(2000); // Wait before retry
        }
      }

      // Prefer center big-play; if not visible in time, use control bar (never combine with .or — two matches)
      const playWait = TIMEOUTS.JOURNEY_PLAYER_AND_STATUS;
      let usedBigPlay = false;
      try {
        await this.journeyBigPlay.waitFor({
          state: "visible",
          timeout: playWait,
        });
        usedBigPlay = true;
      } catch {
        logger.info(
          `Journey big-play not visible within ${playWait}ms, trying control-bar play`,
        );
        await this.journeyPlayControl.waitFor({
          state: "visible",
          timeout: playWait,
        });
      }

      await this.page.waitForTimeout(2000);
      const clickTarget = usedBigPlay ? this.journeyBigPlay : this.journeyPlayControl;
      await clickTarget.click({
        force: true,
        timeout: TIMEOUTS.LONG,
      });
      await this.page.waitForTimeout(13000); // Wait for video to play

      await this.statusOfJourneyText.waitFor({
        state: "visible",
        timeout: TIMEOUTS.JOURNEY_PLAYER_AND_STATUS,
      });

      const journeyStatus = (
        await this.statusOfJourneyText.textContent()
      ).trim();

      logger.info(
        `Played video for user: ${userLogin} in journey ${journeyUuid}. Status: ${journeyStatus}`,
      );
    } catch (error) {
      logger.error(
        `Failed to watch video for user ${userLogin} in journey ${journeyUuid}: ${error.message}`,
      );
      throw error;
    }
  }

  // Upload certificate for certification path
  async uploadCertificate() {
    try {
      await this.page.waitForTimeout(2000);

      // Close any existing popup
      const popupVisible = await this.closePopup.isVisible({
        timeout: TIMEOUTS.SHORT,
      });
      if (popupVisible) {
        await this.closePopup.click({ timeout: TIMEOUTS.SHORT });
      }

      // Click upload certificate button
      await this.uploadCertificateButton.click({ timeout: TIMEOUTS.SHORT });
      await this.page.waitForTimeout(2000);

      // Select issuing body using keyboard
      await this.issuingbodyDropdown.click({ timeout: TIMEOUTS.SHORT });
      await this.page.keyboard.press("ArrowDown");
      await this.page.keyboard.press("Enter");

      // Toggle PDF upload
      await this.toggleUploadpdf.click({ timeout: TIMEOUTS.SHORT });
      await this.page.waitForTimeout(1000);

      // Upload certificate file (increased timeout for parallel execution)
      await this.fileInput.setInputFiles(
        "testData/certificationPaths/Skillsoft_Java_Certificate.pdf",
        { timeout: TIMEOUTS.LONG },
      );
      await this.page.waitForTimeout(4000); // Wait for file to upload and process

      // Add certificate (wait for button to be ready)
      await this.addCertificateButton.waitFor({
        state: "visible",
        timeout: TIMEOUTS.LONG,
      });
      await this.page.waitForTimeout(1000); // Wait for button to be fully enabled
      await this.addCertificateButton.click({ timeout: TIMEOUTS.MEDIUM });
      await this.page.waitForTimeout(3000); // Wait for certificate to be added

      // Fill issue date (wait for field to be ready)
      await this.issueDate.waitFor({
        state: "visible",
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.issueDate.click({ timeout: TIMEOUTS.SHORT });
      await this.issueDate.fill("10/1/2024", { timeout: TIMEOUTS.SHORT });
      await this.issueDate.press("Enter");
      await this.page.waitForTimeout(2000);

      // Calculate expiry date (80 days from now)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 80);
      const formattedDate = `${
        futureDate.getMonth() + 1
      }/${futureDate.getDate()}/${futureDate.getFullYear()}`;

      // Fill expiry date (wait for field to be ready)
      await this.expiryDate.waitFor({
        state: "visible",
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.expiryDate.click({ timeout: TIMEOUTS.SHORT });
      await this.expiryDate.fill(formattedDate, { timeout: TIMEOUTS.SHORT });
      await this.expiryDate.press("Enter");
      await this.page.waitForTimeout(6000); // Extended wait for form validation

      // Wait for Save button to be enabled before clicking
      await this.saveBtn.waitFor({
        state: "visible",
        timeout: TIMEOUTS.LONG,
      });
      await this.page.waitForTimeout(2000); // Wait for form validation

      // Save certificate
      await this.saveBtn.click({ timeout: TIMEOUTS.LONG, force: false });
      await this.page.waitForTimeout(3000);

      // Confirm recipient checkbox
      await this.confirmReceipentCheckbox.waitFor({
        state: "visible",
        timeout: TIMEOUTS.LONG,
      });
      await this.confirmReceipentCheckbox.click({ timeout: TIMEOUTS.SHORT });

      // Wait for Save button to be enabled again after checkbox
      await this.page.waitForTimeout(2000);
      await this.saveBtn.click({ timeout: TIMEOUTS.LONG, force: false });
      await this.page.waitForTimeout(3000);

      logger.info("Certificate uploaded successfully");
    } catch (error) {
      logger.error(`Failed to upload certificate: ${error.message}`);
      throw error;
    }
  }

  // Open study group link
  async openStudyGroupLink(link) {
    try {
      await this.page.goto(link, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUTS.LONG,
      });
      await this.page.waitForTimeout(10000);
      logger.info(`Opened study group link: ${link}`);
    } catch (error) {
      logger.error(`Failed to open study group link: ${error.message}`);
      throw error;
    }
  }

  // Join a study group
  async joinStudyGroup() {
    try {
      await this.joinStudyGroupButton.waitFor({
        state: "visible",
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.joinStudyGroupButton.click({ timeout: TIMEOUTS.SHORT });
      await this.confirmToJoinStudyGroupButton.click({
        timeout: TIMEOUTS.SHORT,
      });
      await this.page.waitForTimeout(5000);
      logger.info("Successfully joined study group");
    } catch (error) {
      logger.error(`Failed to join study group: ${error.message}`);
      throw error;
    }
  }
}
