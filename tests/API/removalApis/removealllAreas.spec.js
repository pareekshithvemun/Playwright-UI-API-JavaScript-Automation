import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { deleteArea } from "../../../helpers/API/apibuilders/deleteArea.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import {test} from "@playwright/test"
import { logger } from "../../../logger.js";

let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Remove all Areas", async ({ request }, testInfo) => {
  testInfo.setTimeout(400000);
  let resdata = await apiresponseValidations.getAreaUUID(
    request,
    urlData.getAreasOfOrgUrl,
    jwt
  );

  let areajsonbody =await resdata.json();
  let areadata=areajsonbody.map(item=>item.uuid);
  logger.info(areadata);

  for (let areaid of areadata) {
    await deleteArea(request, jwt, areaid);
  }
});
