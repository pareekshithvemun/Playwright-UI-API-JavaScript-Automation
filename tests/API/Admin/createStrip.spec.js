import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { createStrip } from "../../../helpers/API/apibuilders/createStrip.js";
import { logger } from "../../../logger.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";

let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Create Strip", async ({ request }, testInfo) => {
  testInfo.setTimeout(1800000);

  let fileName = process.env.FileName;
  let stripData = reusableFunctions.readJsonFile(
    "testData/StripData",
    fileName
  );
  let durationOfStrip = stripData.StripDuration;
  for (let strip of stripData.StripsData) {
    try {
      await createStrip(
        request,
        jwt,
        "Region",
        strip.TitleOfStrip,
        strip.contentOfStrip,
        durationOfStrip,
        strip.locale
      );
    } catch (e) {
      logger.error(`Unable to create strip due to error ${JSON.stringify(e)}`);
    }
  }
});
