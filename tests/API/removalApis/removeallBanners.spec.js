import { test } from "@playwright/test";
import { getAllBannersApi } from "../../../helpers/API/apibuilders/getallbanners.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { deleteBannerapi } from "../../../helpers/API/apibuilders/deleteallbanners.js";
import { logger } from "../../../logger.js";

let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Remove all Banners", async ({ request }, testInfo) => {
  testInfo.setTimeout(400000);
  let bannerData = await getAllBannersApi(request, jwt);
  let bannerIds = bannerData.map((item) => item.bannerUuid);
  logger.info("BannerIDs:");
  logger.info(bannerIds);

  for (let bannerID of bannerIds) {
    await deleteBannerapi(request, jwt, bannerID);
  }
});
