import { expect } from "@playwright/test";
import reusableFunctions from "../helpers/UI/commonFunctions";
import { createuserdata } from "../helpers/API/response/createUserresponse.js";
import { logger } from "../logger.js";

export class aiSimulator {
    constructor(page) {
        this.page = page;
        this.mouse = page.mouse;
        this.agreeButton = page.getByRole('button', { name: 'Agree and Proceed' });
        this.textInput = page.locator("//textarea[@id='chatViewResponseInput']");
        this.endScenario = page.locator("//button[@data-marker='ais.scenarioInput.action.end']")
    }

    async click(locator) {
        await locator.click();
    }

    async sendText(locator, text) {
        await locator.fill(text);
    }

    async clickEnterandWait() {
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(5000)
    }

    async closeSimulator(){
        await this.page.close();
    }
}