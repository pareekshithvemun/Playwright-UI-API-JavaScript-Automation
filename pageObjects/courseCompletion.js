import { expect } from "@playwright/test";
import config from "config";
import reusableFunctions from "../helpers/UI/commonFunctions";
import { logger } from "../logger.js";

const UI_ACTION_TIMEOUT_MS = 30_000;
const SEARCH_UI_TIMEOUT_MS = 30_000;
const CONTENT_LAND_TIMEOUT_MS = 40_000;
/** Video big-play often appears after the initial page settle; Jenkins can exceed default waitFor. */
const VIDEO_PLAY_VISIBLE_MS = 45_000;

export class courseCompletionLP {
  constructor(page) {
    this.page = page;
    // Global search: some orgs render #search_box; others use combobox/searchbox (see skillBenchMarkCompletion).
    this.searchFiled = page
      .locator("input#search_box")
      .or(page.locator('input[role="combobox"]'))
      .or(page.getByRole("searchbox"));
    this.searchSubmit = page.locator('button[data-marker="contentSearchBtn"]');
    // Same idea as span:has-text("Filter by"), but UI uses <h2> inside the filter panel root.
    this.filterByText = page.locator(
      '[class*="SearchFilterMenu---filterMenuRoot"] h2:has-text("Filter by")',
    );
    this.allContentAfterSearch = page.locator('a[data-marker="titleLink"]');
    this.matchingQuestionIdentifier = page.locator(
      'span[class*="Matching---labelAnswerOption"]',
    );
    this.getMatchingQuestionOptionsFromWebPage = page.locator(
      'ul[class*="Matching---ul"] li',
    );
    this.allSubQuestions = page.locator('div[class*="Matching---choice"]');
    this.subquestionChoices = page.locator(
      'div[class*="Matching---inputContainer"]',
    );
    this.courseName = page.locator('h1[class*="MediaTitleV2"]');
    this.courseNameTitleHeader = page.locator('h1[class*="MediaTitleV2---titleHeader"]');
    this.takeTestButton = page.locator('a[data-marker="takeTest"]');
    this.startTest = page.locator(
      'button[data-marker="courseAssessmentStart"]',
    );
    this.question = page.locator('div[class^="QuestionMessages---stem"]');
    this.optionsOfCurrentQuestion = page.locator(
      'div[class*="Question---option"] div[class*="Question---optionLabelWrapper"]',
    );
    this.submitAnswer = page.locator('span:has-text("Submit answer")');
    this.nextQuestionButton = page.locator('span:has-text("Next Question")');
    this.finaldoneButton = page.locator(
      'div[class^="Question---finishButton"]',
    );
    this.scoreCard = page.locator('div[class^="Assessment---scoreNumber"]');
    this.allChoices = page.locator('div[class^="MultipleChoice---choices"]');
    this.closeFeedBackpopUp = page.locator("button#closeModalButton");
    this.contentTypeText = page.locator(
      "label[data-fieldtype='filterMenu'] span[class*='LabelWithCount---wrapLabel']",
    );
    this.expandContentTypeFilter = page.locator(
      "button[data-marker='SearchTypeFilterToggle']",
    );
    this.howdoyouRankPopup = page.getByText("How do you rank?");
    this.caisyCourseIdentifier = page.locator("div[data-marker='label'] span");
    this.caisyCourseHeaderIdentifier = page.locator(
      "div[class*='MediaTitle---innerLeftHeader']",
    );
    this.explorePercipioPopup = page.getByText(
      "Explore what’s new on Percipio!",
    );
    this.gotItButton = page.getByRole("button", { name: "Got it" });
    this.maybeLatterButton = page.getByRole("button", { name: "Maybe later" });
    this.maybeLater = page.getByRole("button", { name: "Maybe Later" });
    this.maybeLaterspan = page.locator(
      "//span[contains(text(),'Maybe Later')]",
    );
    this.launchAISimulatorButton = page.locator(
      "//button[@data-marker='AssetLink']",
    );
    this.agreeButton = page.locator(
      "//button[contains(text(), 'Agree and Proceed')]",
    );
    this.playButton = page.locator("button.vjs-big-play-button").first();
  }

  async click(locator) {
    await locator.click({ timeout: UI_ACTION_TIMEOUT_MS });
  }

  async sendText(locator, text) {
    await locator.fill(text);
  }

  async checkMatchingQuestionOrNot() {
    let isElementVisible = await this.matchingQuestionIdentifier.isVisible();
    if (isElementVisible) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Wait until learner chrome is ready for global search. After popups/onboarding, the shell can be slow;
   * on retry optionally reload org home so search attaches (session preserved).
   */
  async waitForLearnerSearchChrome({ reloadHome = false } = {}) {
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
    if (reloadHome) {
      const baseUrl = config.get("Environment")?.baseURL;
      if (baseUrl) {
        logger.info(`Reloading learner home so search UI can attach: ${baseUrl}`);
        await this.page.goto(baseUrl, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });
      }
    }
    const searchInput = this.searchFiled.first();
    await expect(searchInput).toBeVisible({ timeout: SEARCH_UI_TIMEOUT_MS });
  }

  async executeCourseSearchAttempt(courseName, { reloadHome = false } = {}) {
    await this.waitForLearnerSearchChrome({ reloadHome });
    const searchInput = this.searchFiled.first();
    await searchInput.clear();
    await this.sendText(searchInput, courseName);
    await this.click(this.searchSubmit);
    await this.page.waitForLoadState("load", { timeout: 30000 });
    await expect(this.allContentAfterSearch.first()).toBeVisible({
      timeout: 30000,
    });
  }

  async getMatchingQuestionOptions() {
    let allOptions = await this.getMatchingQuestionOptionsFromWebPage.all();
    const keyValuePairs = [];
    for (let ele of allOptions) {
      const [firstSpan, secondSpan] = await ele.locator("span").all();
      let key = await firstSpan.innerText();
      let kit = key.replace(":", "");
      const value = await secondSpan.innerText();
      keyValuePairs.push({ [kit]: value });
    }
    logger.info(keyValuePairs);
    return keyValuePairs;
  }

  /**
   * Search global content; retry submit + wait for results (like login retries on loginLPUiPage).
   * Flaky under load: empty or slow result lists without a second submit.
   */
  async searchTheCourse(coureName, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt === 1) {
          await reusableFunctions.setTimer(3000);
        } else {
          logger.info(
            `Retrying course search (attempt ${attempt}/${maxAttempts}) for "${coureName}"`,
          );
          await reusableFunctions.setTimer(2000);
        }
        await this.executeCourseSearchAttempt(coureName, {
          reloadHome: attempt > 1,
        });
        return;
      } catch (error) {
        if (attempt >= maxAttempts) {
          logger.error(`Failed to search the course due to error: ${error}`);
          throw error;
        }
        logger.info(
          `Course search attempt ${attempt}/${maxAttempts} failed, trying again...`,
        );
      }
    }
  }

  /**
   * After opening a cert/content item from global search, chrome varies (path hub vs asset vs video).
   * Use fixed slices so we do not spend the full timeout on only the first locator.
   */
  async waitForContentLandAfterCertSearchClick() {
    const sliceMs = Math.max(8000, Math.floor(CONTENT_LAND_TIMEOUT_MS / 5));
    const primaryChrome = this.courseName
      .or(this.courseNameTitleHeader)
      .or(this.caisyCourseHeaderIdentifier);
    const attempts = [
      ["MediaTitleV2 or Caisy header", primaryChrome],
      ['Any "[class*=MediaTitle]"', this.page.locator('[class*="MediaTitle"]').first()],
      ["main h1", this.page.locator("main h1").first()],
      ["page h1", this.page.getByRole("heading", { level: 1 }).first()],
      ["video-js", this.page.locator(".video-js").first()],
    ];
    let lastError;
    for (const [label, locator] of attempts) {
      try {
        await expect(locator).toBeVisible({ timeout: sliceMs });
        logger.info(`Content landed (${label})`);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  async isLocatorVisible(locator, timeoutMs) {
    try {
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  /** Outline / search-list links: exact marker match, then accessible name, then truncated title text. */
  async resolveModuleTitleLink(courseLabel) {
    const trimmed = courseLabel.trim();
    const tryMs = 12000;
    const labelPattern = new RegExp(
      trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    const fragment =
      trimmed.length > 48 ? trimmed.slice(0, 48) : trimmed;
    const candidateLinks = [
      this.page
        .locator('a[data-marker="titleLink"]')
        .filter({ hasText: trimmed })
        .first(),
      this.page.getByRole("link", { name: trimmed }).first(),
      this.page
        .locator('a[data-marker="titleLink"]')
        .filter({ hasText: fragment })
        .first(),
      this.page
        .locator('a[data-marker="titleLink"]')
        .filter({ hasText: labelPattern })
        .first(),
      this.page.getByRole("link", { name: labelPattern }).first(),
    ];

    for (const link of candidateLinks) {
      if (await this.isLocatorVisible(link, tryMs)) {
        return link;
      }
    }

    return candidateLinks[0];
  }

  async clickOnCourse(coureName) {
    const trimmed = coureName.trim();
    const exactLink = this.allContentAfterSearch
      .getByText(trimmed, { exact: true })
      .first();
    const partialLink = this.allContentAfterSearch
      .filter({ hasText: trimmed })
      .first();

    let courseLink = exactLink;
    try {
      await expect(exactLink).toBeVisible({ timeout: 15000 });
    } catch {
      logger.info(
        `Exact title match not found for "${trimmed}", using partial titleLink match`,
      );
      courseLink = partialLink;
      await expect(courseLink).toBeVisible({ timeout: SEARCH_UI_TIMEOUT_MS });
    }

    await courseLink.scrollIntoViewIfNeeded();
    await this.click(courseLink);
    await this.page
      .waitForLoadState("domcontentloaded", { timeout: 30000 })
      .catch(() => {});
    await this.page
      .waitForLoadState("load", { timeout: 30000 })
      .catch(() => {});
    await reusableFunctions.setTimer(2000);
    await this.waitForContentLandAfterCertSearchClick();
  }

  async takeTest() {
    await expect(this.takeTestButton).toBeVisible();
    await this.click(this.takeTestButton);
    await expect(this.startTest).toBeVisible();
    await this.click(this.startTest);
    await expect(this.question).toBeVisible();
    await reusableFunctions.setTimer(2000);
  }
  // use this method only if u are sure that element will be visible in next loaded page
  async waitAndClick(element) {
    await element.waitFor({ state: "visible", timeout: 15000 });
    await expect(element).toBeEnabled({ timeout: 15000 });
    await this.click(element);
  }

  async answeringMatchingQuestionCode(
    matchingQuestionAnswersArray,
    finalQuestion,
  ) {
    let matchingQuesionOptions = await this.getMatchingQuestionOptions();
    const correctAnswer = await this.getCorrectAnswer(
      finalQuestion,
      matchingQuestionAnswersArray,
    );
    logger.info(correctAnswer);
    if (correctAnswer) {
      let subquestionsAndAnswers = correctAnswer.subQuestionAndAnswers;
      let subquestionElements = await this.allSubQuestions.all();
      for (let question of subquestionElements) {
        let subQuestionText = await question.locator("legend").innerText();
        const subQuestioncorrectAnswer = await this.getCorrectAnswer(
          subQuestionText,
          subquestionsAndAnswers,
        );
        const finalAnswersOfMatchingQuestion = subQuestioncorrectAnswer.answer;
        let subquestionChoices = await question
          .locator(this.subquestionChoices)
          .all();
        for (let ans of finalAnswersOfMatchingQuestion) {
          for (let choices of subquestionChoices) {
            let choicetext = await choices.innerText();
            const selectedOption = matchingQuesionOptions.find(
              (option) => Object.values(option)[0] === ans,
            );
            logger.info(selectedOption);
            if (selectedOption) {
              const selectedKey = Object.keys(selectedOption)[0];
              if (selectedKey === choicetext) {
                await this.click(choices);
                break;
              }
            }
          }
        }
      }
    }
  }

  async answerAllQuestionsCorrectly(
    answersArray,
    matchingQuestionAnswersArray,
  ) {
    const questionHtml = await this.question.innerHTML();
    let ques = questionHtml.replace(/<\/?[^>]+(>|$)|&nbsp;/g, "");
    let finalQuestion = ques.replace(/^Question:? /, "").replace(/\n/g, "");
    logger.info(`currentQuestion: ${finalQuestion}`);
    if (await this.checkMatchingQuestionOrNot()) {
      await this.answeringMatchingQuestionCode(
        matchingQuestionAnswersArray,
        finalQuestion,
      );
    } else {
      const correctAnswer = await this.getCorrectAnswer(
        finalQuestion,
        answersArray,
      );
      logger.info(correctAnswer);
      if (correctAnswer) {
        let optionWebElements = await this.optionsOfCurrentQuestion.all();
        const correctAnswerText = correctAnswer.answers;
        for (let ans of correctAnswerText) {
          for (let ele of optionWebElements) {
            let optionText = await ele.innerText();
            if (ans === (await optionText.trim())) {
              await this.waitAndClick(ele);
              logger.info("Option found");
              break;
            } else {
              logger.info("Option is not found");
            }
          }
        }
      } else {
        logger.info(`Answering Unknown Question: ${currentQuestion}`);
        const answerChoice = await this.allChoices;
        const randomIndex = Math.floor(Math.random() * answerChoice.length);
        await this.waitAndClick(answerChoice[randomIndex]);
      }
    }
  }

  async getCorrectAnswer(currentQuestion, answersArray) {
    // filter function return another array
    let trimmedQuestion = await currentQuestion.trim();
    const answer = answersArray.filter(
      (eachQuestion) => eachQuestion.question.trim() === trimmedQuestion,
    );
    return answer[0]; //so that's why we returning first value in answer array which is returned by filter function
  }

  async clickSubmitAnswer() {
    await expect(this.submitAnswer).toBeEnabled();
    await this.click(this.submitAnswer);
  }

  async reloadPage() {
    await this.page.reload();
  }

  async isDoneButtonDisplayed() {
    try {
      await this.waitAndClick(this.finaldoneButton);
      logger.info("done button is visible");
      return true;
    } catch (err) {
      logger.info("done button is not visible");
      return false;
    }
  }

  async isNextQuestionButtonDisplayed() {
    try {
      await this.waitAndClick(this.nextQuestionButton);
      logger.info("Next button is visible");
      return true;
    } catch (err) {
      logger.info("Next button is not visible");
      return false;
    }
  }

  async clickDoneButton() {
    await expect(this.finaldoneButton).toBeEnabled();
    await this.finaldoneButton.click();
  }

  async isScoreCardVisible() {
    await this.scoreCard.waitFor({ state: "visible", timeout: 3000 }); //waiting for its visibility
    await expect(this.scoreCard).toBeEnabled();
    return true;
  }

  async nextQuestion(answerList, matchingQuestionAnswersArray) {
    //this is used to iterate through all question and it will terminate once use see done button till then this function calls itself recursively
    const isDoneButtonDisplayed = await this.isDoneButtonDisplayed();
    if (isDoneButtonDisplayed) {
      return;
    }

    const isNextQuestionButtonDisplayed =
      await this.isNextQuestionButtonDisplayed();
    if (isNextQuestionButtonDisplayed) {
      await this.answerAllQuestionsCorrectly(
        answerList,
        matchingQuestionAnswersArray,
      );
      await this.clickSubmitAnswer();
      await this.nextQuestion(answerList, matchingQuestionAnswersArray);
    }
  }

  async closeFeedBackDialog() {
    if (this.closeFeedBackpopUp.isVisible()) {
      await this.waitAndClick(this.closeFeedBackpopUp);
    }
  }

  async popupHandlerinHomepage() {
    if (await this.howdoyouRankPopup.isVisible()) {
      await this.page.addLocatorHandler(this.howdoyouRankPopup, async () => {
        await this.maybeLatterButton.click();
      });
    } else if (await this.maybeLaterspan.isVisible()) {
      await this.page.addLocatorHandler(this.maybeLaterspan, async () => {
        await this.maybeLaterspan.click();
      });
    } else if (await this.maybeLatterButton.isVisible()) {
      await this.page.addLocatorHandler(this.maybeLatterButton, async () => {
        await this.maybeLatterButton.click();
      });
    } else if (await this.maybeLatterButton.isVisible()) {
      await this.maybeLaterspan.click();
    }
  }

  async launchAISimulator() {
    if (
      (await this.caisyCourseIdentifier.isVisible()) &&
      (await this.caisyCourseHeaderIdentifier.isVisible())
    ) {
      if (await this.launchAISimulatorButton.isVisible()) {
        await this.waitAndClick(this.launchAISimulatorButton);
      }
    }
  }

  async agreeandProceed() {
    if (
      await this.agreeButton.isVisible({ timeout: 4000 }).catch(() => false)
    ) {
      await this.waitAndClick(this.agreeButton);
    }
  }
  async explorePercipioPopupHandler() {
    if (await this.explorePercipioPopup.isVisible()) {
      await this.page.addLocatorHandler(this.explorePercipioPopup, async () => {
        await this.gotItButton.click();
      });
    }
  }
  /** Path outline: open module by title link, then big-play (same shape as the original flow). */
  async clickOnCourseandPlayButton(courseName) {
    const trimmed = courseName.trim();
    const moduleLink = await this.resolveModuleTitleLink(trimmed);
    await expect(moduleLink).toBeVisible({ timeout: SEARCH_UI_TIMEOUT_MS });
    await moduleLink.scrollIntoViewIfNeeded();
    await this.click(moduleLink);
    await this.agreeandProceed();
    await reusableFunctions.setTimer(8000);
    await this.playButton.waitFor({
      state: "visible",
      timeout: VIDEO_PLAY_VISIBLE_MS,
    });
    await this.playButton.click({ force: true, timeout: UI_ACTION_TIMEOUT_MS });
    await reusableFunctions.setTimer(4000);
    logger.info(`played video in course ${courseName}`);
  }
}
