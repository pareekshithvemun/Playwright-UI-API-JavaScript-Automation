import { headerData } from "../headers/allHeaders";
import { urlData } from "../url/allUrls.js";
import { tokenGeneratorApipayload } from "../payloads/tokenGeneratorApipayload";
import config from "config";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import reusableFunctions from "../../UI/commonFunctions.js";


export async function generateToken(request, retryCount = 0) {
  try {
    let res = await request.post(urlData.devtokenGeneratorapiUrl, {
      data: tokenGeneratorApipayload(
        config.get("Admindata").loginID,
        config.get("Admindata").password
      ),
      headers: headerData.tokenGeneratorApiHeader("application/json"),
    });
    expect(res.status()).toBe(200);
    let token = await res.json();
    let jwtToken = token["id_token"];
    logger.info(`Admin Token has been generated in attempt ${retryCount+1}`);
    return jwtToken;
  } catch (error) {
    if (retryCount < 10) {
      logger.error(`Unable to generate admin token. Retrying... (Retry ${retryCount + 1} of 10)`);
      logger.error(error);
      await reusableFunctions.setTimer(500);
      generateToken(request, retryCount + 1);
    } else {
      let errorMessage = `Retry limit exceeded (10 attempts). Unable to generate admin token. Error: ${error}`;
      logger.error(errorMessage);
    }
  }
}

