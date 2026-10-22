import { expect } from "@playwright/test";
export class newUserPreScreens {
  constructor(page) {
    this.page = page;
    this.pageHeader = page.locator("(//h1)[2]");
    this.roleInputField = page.locator('input[id="yourRole"]');
    this.roleListSelectorUI = page.locator('ul[id="typeahead-list"]');
    this.eachIndividualRole = page.locator('ul[id="typeahead-list"] li');
    this.nextButton = page.locator('button[data-coga-action="next"]');
    this.mayBeLaterButton = page.locator(
      'button[data-marker="onboardingJobRolesMaybeLater"]'
    );
    this.secondPageHeader = page.locator(
      `h1:has-text("Choose a few topics you'd like to learn")`
    );
    this.thirdPageHeader = page.locator(
      'h1:has-text("Tell us a little more.")'
    );
    this.goToFinalStepButton = page.locator(
      'button[data-marker="onboardingPageContinueToFinalStep"]'
    );
    this.goToHomeButton = page.locator(
      'button[data-marker="onboardingPageContinueToHomepage"]'
    );
    this.topicTolearn = (text) => page.getByText(text, { exact: true });
    this.subTopic = (text) => page.getByText(text, { exact: true });
  }

  async click(locator) {
    await locator.click();
  }

  async waitforElement(ele) {
    const loc = await ele.locator();
    await this.page.waitForSelector(loc);
  }

  async clickUserButton() {
    await this.click(this.UsersButton);
  }

  async sendText(locator, text) {
    await locator.fill(text);
  }

  async firstScreenIntro() {
    await expect(this.pageHeader).toHaveText(
      "Help us personalize your learning experience"
    );
    await this.sendText(this.roleInputField, "Automation");
    await expect(this.roleListSelectorUI).toBeVisible();
    let elements = await this.eachIndividualRole.all();
    for (const ele of elements) {
      // Get the inner text of the current element
      const innerText = await ele.innerText();
      if (innerText.includes("Automation Engineer")) {
        await this.click(ele);
      }
    }
    await this.click(this.nextButton);
  }

  async secondScreenIntro(topicText) {
    await expect(this.secondPageHeader).toHaveText(
      "Choose a few topics you'd like to learn"
    );
    await this.click(this.topicTolearn(topicText));
    await this.click(this.goToFinalStepButton);
  }

  async thirdScreenIntro(subTopicText) {
    await expect(this.thirdPageHeader).toHaveText("Tell us a little more.");
    if (typeof subTopicText === "string") {
      await this.click(this.subTopic(subTopicText));
    } else if (Array.isArray(subTopicText)) {
      for (let topic of subTopicText) {
        await this.click(this.subTopic(topic));
      }
    }
    await this.click(this.goToHomeButton);
  }
}
