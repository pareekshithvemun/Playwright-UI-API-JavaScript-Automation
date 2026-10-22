import { expect } from "@playwright/test";
import reusableFunctions from "../helpers/UI/commonFunctions";
import { logger } from "../logger.js";


export class SkillBenchMark {
  constructor(page) {
    this.page = page;
    this.mouse = page.mouse;
    this.searchFiled = page.locator('input[role="combobox"]');
    this.searchSubmit = page.locator('button[data-marker="contentSearchBtn"]');
    this.filterByText = page.locator('span:has-text("Filter by")');
    this.searchResults = page.locator('div[class*="ItemInfo---fullWidth"]');
    this.contentTypeTextElement = page.locator(
      'div[data-marker="ContentTypeDisplay"]'
    );
    this.feedbackpollofskillBenchMark = page.locator(
      'button[aria-label="Close skill benchmark feedback poll"]'
    );
    this.searchResultText = page.locator('h2 a[data-marker="titleLink"]');
    this.contentNameLocator = page.locator(
      'h1[class*="MediaTitleV2---titleHeader"]'
    );
    this.searchMoreButton = page.locator(
      'button[data-marker="SearchShowMore"]'
    );
    //this.takeTestButton = page.locator('a[data-marker="takeTest"]');
    this.startTest = page.locator(
      'button[data-marker="courseAssessmentStart"]'
    );
    this.matchingQuestionIdentifier = page.locator(
      'span[class*="Matching---labelAnswerOption"]'
    );
    this.getMatchingQuestionOptionsFromWebPage = page.locator(
      'ul[class*="Matching---ul"] li'
    );
    this.allSubQuestions = page.locator('div[class*="Matching---choice"]');
    this.subquestionChoices = page.locator(
      'div[class*="Matching---inputContainer"]'
    );
    this.optionstoselectWrongAnswerForMatchingQuestion = page.locator(
      'div[class*="Matching---choice"] div[class*="Matching---inputContainer"]'
    );

    this.question = page.locator('div[class^="QuestionMessages---stem"]');
    this.scoreCard = page.locator('div[class^="Assessment---scoreNumber"]');
    this.allChoices = page.locator('div[class^="MultipleChoice---choices"]');
    this.closeFeedBackpopUp = page.locator("button#closeModalButton");
    this.advanceleveldialog = page.locator(
      'div[aria-labelledby="modalDialogTitle"]'
    );
    this.contentTypeTextInSideFilter = page.locator(
      "label[data-fieldtype='filterMenu'] span[class*='LabelWithCount---wrapLabel']"
    );
    this.expandContentTypeFilter = page.locator(
      "button[data-marker='SearchTypeFilterToggle']"
    );
    this.benchMarkStartedOrNotText = page.locator(
      "div[data-marker*='gaugeChart']"
    );
    this.benchMarkStateText = page.locator(
      "div[class*='AssessmentAssetHeaderV2---messageBoxText']"
    );
    this.startSkillBenchMark = page.locator(
      'a[data-marker="LP.assessmentAsset.skillBenchmarkLaunch"]'
    );
    this.restartSkillBecnchMark = page.locator(
      'a[data-marker="LP.assessmentAsset.skillBenchmark Restart"]'
    );

    this.updateSkillBenchMark = page.locator(
      'a[data-marker="LP.assessmentAsset.updateSkillbenchmark"]'
    );

    this.continueSkillBenchMark = page.locator(
      'a[data-marker="LP.assessmentAsset.skillBenchmarkContinue"]'
    );
    this.submitAnswer = page.locator(
      'button[data-marker="LP.assessments.verify.skillBenchmark"]'
    );
    this.nextQuestionButton = page.locator(
      'button[data-marker="LP.assessments.next.skillBenchmark"]'
    );
    this.dontKnowButton = page.locator('button[data-marker="answerDoNotKnow"]');
    this.saveAndExitButton = page.locator(
      'button[data-marker="LP.assessments.saveAndExit.skillBenchmark"]'
    );
    this.finaldoneButton = page.locator(
      'button[data-marker="LP.assessments.finish.skillBenchmark"]'
    );
    this.questionCountOfSkillBenchMark = page.locator(
      'div[class*="AssessmentAssetHeaderV2---metadata"] span span:nth-child(1)'
    );
    this.textToGetSkillBenchMarkScore = page.locator("div g text");
    this.optionsOfCurrentQuestion = page.locator(
      'div[class*="Question---option"] div[class*="Question---optionLabelWrapper"]'
    );
  }

  async click(locator) {
    await locator.click();
  }

  async scrollPage(deltaX, deltaY) {
    await this.mouse.wheel(deltaX, deltaY);
  }

  async sendText(locator, text) {
    await locator.fill(text);
  }

  // use this method only if u are sure that element will be visible in next loaded page
  async waitAndClick(element) {
    await element.waitFor({ state: "visible", timeout: 4000 });
    await expect(element).toBeEnabled();
    await this.click(element);
  }

  async returnOptionsOfCurrentQuestion() {
    let optionWebElements = await this.optionsOfCurrentQuestion.all();
    let arr = [];
    for (let ele of optionWebElements) {
      arr.push(await ele.innerText());
    }
    return arr;
  }

  async getWrongAnswers(correctAnswersArray, allAnswersArray) {
    let wrongAnswersArray = allAnswersArray.filter(
      (answer) => !correctAnswersArray.includes(answer)
    );
    return wrongAnswersArray;
  }

  async checkMatchingQuestionOrNot() {
    let isElementVisible = await this.matchingQuestionIdentifier.isVisible();
    if (isElementVisible) {
      return true;
    } else {
      return false;
    }
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

  async getSkillBenchMarkquestionCount() {
    let number;
    await expect(this.questionCountOfSkillBenchMark).toBeVisible();
    let text = await this.questionCountOfSkillBenchMark.innerText();
    const match = await text.match(/\d+/);
    if (match) {
      number = parseInt(match[0]);
      logger.info(`Number of question in SkillBenchMark: ${number}`);
    } else {
      logger.info("No number found in the text.");
    }
    return number;
  }

  async searchTheCourse(coureName) {
    try {
      await expect(this.searchFiled).toBeVisible({ timeout: 15000 });
      await this.sendText(this.searchFiled, coureName);
      await this.click(this.searchSubmit);
      await expect(this.filterByText).toBeVisible({ timeout: 15000 });
      await expect(this.filterByText).toBeAttached({ timeout: 15000 });
    } catch (error) {
      logger.info(error);
    }
  }

  async clickOnViewMoreResults() {
    await this.click(await this.searchMoreButton);
  }

  async clickOnContent(contentName, contentType) {
    let elementFoundOrNot = false;
    while (!elementFoundOrNot) {
      let elements = await this.searchResults.all();
      for (let ele of elements) {
        let contentTypeEle = await ele.locator(this.contentTypeTextElement);
        let contentTypeText = await contentTypeEle.innerText();
        if (contentTypeText === contentType) {
          let contentText = await ele
            .locator(this.searchResultText)
            .innerText();
          if (contentText === contentName) {
            await this.click(await ele.locator(this.searchResultText));
            elementFoundOrNot = true;
            break;
          }
        }
      }
      await this.scrollPage(0, 250);
      await reusableFunctions.setTimer(1000);
      // let nextPageButton = await this.searchMoreButton;
      // if (nextPageButton) {
      //   await this.searchMoreButton.scrollIntoViewIfNeeded();
      //   await this.click(this.searchMoreButton);
      // } else {
      //   allResultsProcessed = true;
      // }
    }
    await expect(this.contentNameLocator).toBeVisible();
    await expect(this.contentNameLocator).toBeAttached();
  }

  async checkBenchMarkIsAvailable() {
    await reusableFunctions.setTimer(2500);
    let text;
    const isBenchMarkVisible = await this.benchMarkStateText.isVisible();
    if (isBenchMarkVisible) {
      text = await this.benchMarkStateText.innerText();
      if (
        text ===
        "This skill benchmark is already in progress. Would you like to continue or start a new one?"
      ) {
        logger.info(
          `BecnhMark already in Progress. So tap on continue or restart`
        );
        return false;
      } else {
        logger.info(
          `This BenchMark is not available for this user due to: ${text}`
        );
        return true;
      }
    } else {
      let benchMarkStartedOrNot = await this.startSkillBenchMark.isVisible();
      logger.info(benchMarkStartedOrNot);
      if (benchMarkStartedOrNot) {
        logger.info("Taking this skillbenchMark for first time");
        return false;
      } else if (await this.updateSkillBenchMark.isVisible()) {
        logger.info("Upating the score for this skillBenchMark");
        return false;
      } else {
        logger.info(`This skillbenchMark has already been taken for this user`);
        return true;
      }
    }
  }

  async startContent() {
    if (
      this.startSkillBenchMark.isVisible() ||
      this.restartSkillBecnchMark.isVisible() ||
      this.updateSkillBenchMark.isVisible()
    ) {
      try {
        await expect(this.startSkillBenchMark).toBeVisible({ timeout: 1500 });
        await this.click(this.startSkillBenchMark);
        logger.info("started skill benchMark");
      } catch (error) {
        try {
          await expect(this.restartSkillBecnchMark).toBeVisible({ timeout: 1500 });
          await this.click(this.restartSkillBecnchMark);
          logger.info("Restarted skill benchMark");
        } catch (error) {
          await this.click(this.updateSkillBenchMark);
          logger.info("Tapped on update skill benchmark button");
        }
      }
    }  else {
      logger.info("No button to start or restart skillBenchMark");
    }
    await expect(this.question).toBeVisible();
    await reusableFunctions.setTimer(2000);
  }

  async decideNumberOfQuestionToBeAnsweredCorrectly(
    categoryType,
    totalQuestions
  ) {
    let categories = {
      Novice: { min: 0, max: 9 },
      Aspiring: { min: 10, max: 49 },
      Developing: { min: 50, max: 69 },
      Proficient: { min: 70, max: 89 },
      Advanced: { min: 90, max: 100 },
    };
    let result = {};
    for (const category in categories) {
      let { min } = categories[category];
      let correctAnswersNeeded = Math.ceil((min / 100) * totalQuestions);
      result[category] = correctAnswersNeeded;
    }
    logger.info(
      `Number of questions to be answered correctly to fall into ${categoryType} is ${result[categoryType]}`
    );
    logger.info(result);
    return result[categoryType];
  }

  async answeringMatchingQuestionCode(
    matchingQuestionAnswersArray,
    finalQuestion
  ) {
    let matchingQuesionOptions = await this.getMatchingQuestionOptions();
    const correctAnswer = await this.getCorrectAnswer(
      finalQuestion,
      matchingQuestionAnswersArray
    );
    logger.info(correctAnswer);
    if (correctAnswer) {
      let subquestionsAndAnswers = correctAnswer.subQuestionAndAnswers;
      let subquestionElements = await this.allSubQuestions.all();
      for (let question of subquestionElements) {
        let subQuestionText = await question.locator("legend").innerText();
        const subQuestioncorrectAnswer = await this.getCorrectAnswer(
          subQuestionText,
          subquestionsAndAnswers
        );
        const finalAnswersOfMatchingQuestion = subQuestioncorrectAnswer.answer;
        let subquestionChoices = await question
          .locator(this.subquestionChoices)
          .all();
        for (let ans of finalAnswersOfMatchingQuestion) {
          for (let choices of subquestionChoices) {
            let choicetext = await choices.innerText();
            const selectedOption = matchingQuesionOptions.find(
              (option) => Object.values(option)[0] === ans
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
      logger.info("Answered matching question correctly");
    }
  }

  async answeringMatchingQuestionIncorrectly() {
    let elements =
      await this.optionstoselectWrongAnswerForMatchingQuestion.all();
    for (let ele of elements) {
      await this.click(ele);
      break;
    }
    logger.info("Answered matching question Incorrectly");
  }
  async answerAllQuestionsCorrectly(
    answersArray,
    matchingQuestionAnswersArray,
    totalQuestionsInBenchMark,
    categoryType,
    currentQuestionCount
  ) {
    logger.info(`currentQuestionCount:${currentQuestionCount}`);
    let finalQuestion, numberOfQuestionsToBeAnsweredCorrectly;
    //const currentQuestion = await this.question.innerText();
    const questionHtml = await this.question.innerHTML();
    let ques = questionHtml.replace(/<\/?[^>]+(>|$)|&nbsp;/g, "");
    finalQuestion = ques.replace(/^Question:? /, "").replace(/\n/g, "");
    logger.info(`currentQuestion: ${finalQuestion}`);
    if (currentQuestionCount === 1) {
      numberOfQuestionsToBeAnsweredCorrectly =
        await this.decideNumberOfQuestionToBeAnsweredCorrectly(
          categoryType,
          totalQuestionsInBenchMark
        );
    }
    if (await this.checkMatchingQuestionOrNot()) {
      if (currentQuestionCount >= numberOfQuestionsToBeAnsweredCorrectly) {
        await this.answeringMatchingQuestionIncorrectly();
      } else {
        await this.answeringMatchingQuestionCode(
          matchingQuestionAnswersArray,
          finalQuestion
        );
      }
    } else {
      const correctAnswer = await this.getCorrectAnswer(
        finalQuestion,
        answersArray
      );
      logger.info(correctAnswer);
      let allAnswers = await this.returnOptionsOfCurrentQuestion();
      logger.info(allAnswers);
      let wrongAnswer = await this.getWrongAnswers(
        correctAnswer.answers,
        allAnswers
      );
      logger.info(wrongAnswer);
      if (correctAnswer) {
        let optionWebElements = await this.optionsOfCurrentQuestion.all();
        if (currentQuestionCount >= numberOfQuestionsToBeAnsweredCorrectly) {
          for (let ans of wrongAnswer) {
            for (let ele of optionWebElements) {
              let optionText = await ele.innerText();
              logger.info(`ans:${ans}`);
              logger.info(`optionText:${optionText}`);
              if (ans === (await optionText.trim())) {
                await this.waitAndClick(ele);
                logger.info("Option found");
                break;
              } else {
                logger.info("Option is not found");
              }
            }
            // const selector = `//div[normalize-space(text())='${ans}']/parent::div`;
            // const element = await this.page.locator(selector);
            // await this.waitAndClick(element);
          }
          logger.info(`answered ${finalQuestion} incorrectly`);
        } else {
          const correctAnswerText = correctAnswer.answers;
          for (let ans of correctAnswerText) {
            for (let ele of optionWebElements) {
              let optionText = await ele.innerText();
              logger.info(`ans:${ans}`);
              logger.info(`optionText:${optionText}`);
              if (ans === (await optionText.trim())) {
                await this.waitAndClick(ele);
                logger.info("Option found");
                break;
              } else {
                logger.info("Option is not found");
              }
            }
            // const selector = `//div[normalize-space(text())='${ans}']/parent::div`;
            // const element = await this.page.locator(selector);
            // await this.waitAndClick(element);
          }
          logger.info(`answered ${finalQuestion} correctly`);
        }
      } else {
        logger.info(`Answering Unknown Question: ${finalQuestion}`);
        const answerChoice = await this.allChoices;
        const randomIndex = Math.floor(Math.random() * answerChoice.length);
        await this.waitAndClick(answerChoice[randomIndex]);
      }
    }
  }

  async getCorrectAnswer(Question, answersArray) {
    // filter function return another array
    try {
      let trimmedQuestion = await Question.trim();
      const answer = answersArray.filter(
        (eachQuestion) => eachQuestion.question.trim() === trimmedQuestion
      );
      logger.info(answer);
      return answer[0];
    } catch (error) {
      logger.info("question Not found");
    }
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

  async nextQuestion(
    answerList,
    matchingQuestionAnswersArray,
    totalQuestionsInBenchMark,
    categoryType,
    currentQuestionCount
  ) {
    //this is used to iterate through all question and it will terminate once use see done button till then this function calls itself recursively
    const isDoneButtonDisplayed = await this.isDoneButtonDisplayed();
    if (isDoneButtonDisplayed) {
      return;
    }
    const isNextQuestionButtonDisplayed =
      await this.isNextQuestionButtonDisplayed();
    if (isNextQuestionButtonDisplayed) {
      currentQuestionCount++;
      await this.answerAllQuestionsCorrectly(
        answerList,
        matchingQuestionAnswersArray,
        totalQuestionsInBenchMark,
        categoryType,
        currentQuestionCount
      );
      await this.clickSubmitAnswer();
      await this.nextQuestion(
        answerList,
        matchingQuestionAnswersArray,
        totalQuestionsInBenchMark,
        categoryType,
        currentQuestionCount
      );
    }
  }

  async closeFeedBackDialogs() {
    //advance level pop-up code
    let ele = await this.waitForDialogWithRetry(10, this.advanceleveldialog);
    logger.info(ele);
    if (ele) {
      try {
        await this.waitAndClick(this.closeFeedBackpopUp);
        logger.info(
          "It tapped on close button of advance level pop-up of skillbenchmark"
        );
      } catch (error) {
        logger.info("advance level pop-up not visibile this time");
      }
    } else {
      logger.info("advance level pop-up not visibile this time");
    }
    //feedback pop-up code
    let feedbackDialog = await this.waitForDialogWithRetry(
      10,
      this.feedbackpollofskillBenchMark
    );
    logger.info(feedbackDialog);
    if (feedbackDialog) {
      try {
        await this.waitAndClick(feedbackDialog);
        logger.info("It tapped on Feedback dialog of skillbenchMark");
      } catch (error) {
        logger.info("Feedback dialog is not visibile this time");
      }
    } else {
      logger.info("Feedback dialog is not visibile this time");
    }
  }

  async waitForDialogWithRetry(maxAttempts, ele) {
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const dialog = await ele;
        if (dialog) {
          return dialog;
        }
        await reusableFunctions.setTimer(500);
      }
    } catch (error) {
      logger.info("Dialog not found after multiple attempts");
    }
  }

  async getSkillBenchMarkScore(benchMarkName) {
    try {
      if (await this.textToGetSkillBenchMarkScore.isVisible()) {
        const innerTextValue =
          await this.textToGetSkillBenchMarkScore.innerText();
        logger.info(`BenchmarkScore of ${benchMarkName} is: ${innerTextValue}`);
      }
    } catch (error) {
      logger.info("Error getting skill benchmark score:", error.message);
    }
  }
}
