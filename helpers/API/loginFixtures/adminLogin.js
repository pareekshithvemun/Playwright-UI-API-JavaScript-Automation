import { loginLPUiPage, openBrowser } from "/Users/phv/myprojects/Playwright-UI-API-JavaScript-Automation/pageObjects/loginLPUiPage.js";
const { test, expect } = require('@playwright/test');
import config from "config";
import { logger } from "../../../logger.js";


let loginLPUiPageObj;


exports.expect = expect;
exports.test = test.extend({
adminApp: async ({ browser, page },use)=> 
    {
        try {
            const context = await browser.newContext();
            page = await context.newPage();
            loginLPUiPageObj = new loginLPUiPage(page);
            await loginLPUiPageObj.openBrowser();
           } catch (error) {
            logger.info("Unable to start the browser");
            
    }
    
        try {
            await loginLPUiPageObj.login(config.get("Admindata").loginID,config.get("Admindata").password);
            await use(page)
    
   } catch (error) {
    logger.info("Unable to login")
   }
},

});





