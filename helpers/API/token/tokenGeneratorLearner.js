import { headerData } from "../headers/allHeaders";
import { urlData } from "../url/allUrls.js";
import { tokenGeneratorApipayload } from "../payloads/tokenGeneratorApipayload";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import reusableFunctions from "../../UI/commonFunctions.js";


export async function generateTokenLearner(request, username, password, retryCount = 0) {
  try {
    const res = await request.post(urlData.devtokenGeneratorapiUrl, {
      data: tokenGeneratorApipayload(username, password),
      headers: headerData.tokenGeneratorApiHeader("application/json"),
    });
    expect(res.status()).toBe(200);
    const token = await res.json();
    let jwtToken = token["id_token"];
    logger.info(`Learner Token has been generated in attempt ${retryCount+1} for user ${username}`);
    return jwtToken;
  } catch (error) {
    if (retryCount < 10) {
      logger.error(`Unable to generate learner token for user ${username}. Retrying... (Retry ${retryCount + 1} of 10)`);
      logger.error(error);
      await reusableFunctions.setTimer(500);
      generateTokenLearner(request, username, password, retryCount + 1);
    } else {
      let errorMessage = `Retry limit exceeded (10 attempts). Unable to generate learner token for user ${username}. Error: ${error}`;
      logger.error(errorMessage);
    }
  }
}