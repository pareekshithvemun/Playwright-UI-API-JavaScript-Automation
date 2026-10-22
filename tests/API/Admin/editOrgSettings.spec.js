import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { orgSettingsApi } from "../../../helpers/API/apibuilders/orgSettingsApi.js";
import { logger } from "../../../logger.js";


let jwt;

test.beforeAll("get Token", async ({ request }) => {
    jwt = await generateToken(request);
  });

  test("Edit Org Settings", async ({ request }) => {
    let regionsForILT=["US", "UK"]
    let resp=await orgSettingsApi(request,jwt,regionsForILT,14,70,"Custom Area");
    logger.info(resp);
  });