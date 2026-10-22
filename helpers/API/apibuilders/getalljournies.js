import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { getAllJournies, getJourneyByName } from "../../API/payloads/getAllJournies.js";
import { logger } from "../../../logger.js";

export async function getAllJourniesApi(request, jwt) {
  try {
    let headerdataofgetallJournies = headerData.getAllJourneyHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.getChannelsorJourneysInOrgUrl, {
      data: getAllJournies(),
      headers: headerdataofgetallJournies,
    });
    expect(res.status()).toBe(200);
    let respofAllJourneyApiData = await res.json();
    let allJourneyUUIds = respofAllJourneyApiData["channels"].map(
      (item) => item["channelUuid"]
    );
    return { respofAllJourneyApiData, allJourneyUUIds };
  } catch (e) {
    logger.info(`Failed to get all Journey due to error:${e}`);
  }
}

export async function getjourneyId(request, jwt, journeyName) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let headerdataofgetallJournies = headerData.getAllJourneyHeaders(
        jwt,
        "application/json"
      );
      // Use server-side filtering with term parameter for faster results
      let res = await request.post(urlData.getChannelsorJourneysInOrgUrl, {
        data: getJourneyByName(journeyName),
        headers: headerdataofgetallJournies,
        timeout: 15000, // 15 second timeout
      });
      expect(res.status()).toBe(200);
      let resp = await res.json();
      
      // Find exact match from filtered results
      const matchedChannel = resp.channels.find((channel) =>
        channel.localizations.some(
          (localization) => localization.title === journeyName
        )
      );

      return matchedChannel?.channelUuid || null;
    } catch (e) {
      if (attempt < maxRetries) {
        const delay = baseDelay * attempt;
        logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for journey "${journeyName}": ${e.message}. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error(
          `Failed to get journey "${journeyName}" after ${maxRetries} attempts: ${e.message}`
        );
        return null;
      }
    }
  }
}
