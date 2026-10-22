import { test } from "@playwright/test";
import { getAllJourniesApi } from "../../../helpers/API/apibuilders/getalljournies.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { deletechannel } from "../../../helpers/API/apibuilders/deleteChannel.js";
import { retirechannel } from "../../../helpers/API/apibuilders/retireChannel.js";
import { logger } from "../../../logger.js";

let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Remove all Journies", async ({ request }, testInfo) => {
  testInfo.setTimeout(40000);
  let Journeydata = await getAllJourniesApi(request, jwt);
  let respofapi = Journeydata.respofAllJourneyApiData;
  let journeyinDraft = respofapi.channels
    .filter((item) => item.status === 0)
    .map((item) => item.channelUuid);
  let journeyinPublishedStateandUnpublishedState = respofapi.channels
    .filter((item) => item.status === 2 || item.status === 1)
    .map((item) => item.channelUuid);
  let journeyinretiredstate = respofapi.channels
    .filter((item) => item.status === 3)
    .map((item) => item.channelUuid);

  logger.info("journeyinDraft:");
  logger.info(journeyinDraft);
  logger.info("journeyinPublishedStateandUnpublishedState:");
  logger.info(journeyinPublishedStateandUnpublishedState);
  logger.info("journeyinretiredstate");
  logger.info(journeyinretiredstate);

  for (let journeyId of journeyinDraft) {
    await deletechannel(request, jwt, journeyId);
  }

  for (let id of journeyinPublishedStateandUnpublishedState) {
    await retirechannel(request, jwt, id);
  }

  logger.info("journeyinDraft:");
  logger.info(journeyinDraft);

  logger.info("journeyinPublishedStateandUnpublishedState:");
  logger.info(journeyinPublishedStateandUnpublishedState);
});
