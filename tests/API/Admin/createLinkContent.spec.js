import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { createLinkedContent } from "../../../helpers/API/apibuilders/createLinkCustomContentApi.js";
import { publishLinkContent } from "../../../helpers/API/apibuilders/publishLinkContent.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";

let jwt;

test.describe("Create custom link content suite", () => {
  test.beforeAll("get Admin Token", async ({ request }) => {
    jwt = await generateToken(request);
  });
  test("Create custom link content", async ({ request }, testInfo) => {
    testInfo.setTimeout(20000);

    let pathofCustomLink =
      "testData/customContentTestData/customContentTestData.json";
    let customLink =
      reusableFunctions.readDatafromJsonFilenotasync(pathofCustomLink);
    for (let obj of customLink.linkCustomContent) {
      let linkContenuuid = await createLinkedContent(
        request,
        jwt,
        obj.title,
        obj.contentUrl,
        obj.desc,
        obj.imageUrl,
        obj.modality,
        obj.duration
      );
      await publishLinkContent(request, jwt, linkContenuuid);
    }
  });
});
