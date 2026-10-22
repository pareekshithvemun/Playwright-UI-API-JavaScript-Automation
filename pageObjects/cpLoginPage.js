import { logger } from "../logger.js";

let cpUrl = "https://use1-stage-cp.stage.percipio.com/";
let retryCount;
export class cpLoginPage {
  constructor(browser,page) {
    this.browser=browser;
    this.page = page;
    this.username = page.locator("(//input[@name='username'])[2]");
    this.password = page.locator("(//input[@name='password'])[2]");
    this.submitBtn = page.locator("(//input[@name='signInSubmitButton'])[2]");
  }
  async openCp() {
    if (cpUrl) {
      try {
        await this.page.goto(cpUrl, {
          timeout: 500000,
          waitUntil: "load",
        });
        await this.username.waitFor({ state: "visible", timeout: 800000 });
        await this.password.waitFor({ state: "visible", timeout: 800000 });
      } catch (error) {
        logger.error("Error navigating to the page:", error);
        await this.page.close();
      }
    }
  }

  async click(locator) {
    await locator.click();
  }

  async closeBrowser(){
    await this.browser.close();
  }

  async login(userId, password) {
    await this.username.fill(userId);
    await this.password.fill(password);
    await this.click(this.submitBtn);
  }

  async getRefreshTokenFromLocalStorage() {
    await this.openCp();
    await this.login("ui-test@skillsoft.com", "Test321!");
    await this.page.waitForURL("https://use1-stage-cp.stage.percipio.com/", {
      waitUntil: "domcontentloaded",
    });
    retryCount = 1;
    const jwtToken = await this.page.evaluate(async (retryCount) => {
      while (retryCount <= 10) {
        let token = localStorage.getItem("id_token");
        if (token) {
          return token;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 900));
          retryCount++;
        }
      }
      return null;
    }, retryCount);
    logger.info(`retried ${retryCount} times`);

    return jwtToken;
  }
}
