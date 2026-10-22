import { expect, test } from "@playwright/test";
import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { createAttributePayload } from "../../../helpers/API/payloads/createAttributepayload.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { logger } from "../../../logger.js";
import { addAttributeValuesApi } from "../../../helpers/API/apibuilders/addAttributesApi.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";

let customAttributeUuid;
let jwt;
let pathofattributeData = "testData/attributeValues/attributeData.json";
let attrNames =
  reusableFunctions.readDatafromJsonFilenotasync(pathofattributeData);

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Create Attribute and addValues to each attribute", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(20000);
  for (let atr of attrNames.attributeData) {
    try {
      let headerofcreatt = headerData.attributeCreateapiHeaders(
        jwt,
        "application/json"
      );
      const attresponse = await request.post(urlData.urlOfCreateAttribute, {
        data: createAttributePayload(atr.attributeName, true, "VALUE", true),
        headers: headerofcreatt,
      });
      expect(attresponse.status()).toBe(200);
      const createattRes = await attresponse.json();
      customAttributeUuid = createattRes["customAttributeUuid"];
      logger.info(customAttributeUuid);
      await addAttributeValuesApi(
        request,
        jwt,
        customAttributeUuid,
        atr.attributeName,
        atr.attributeValues
      );
    } catch (error) {
      logger.error(`Failed to create attribute "${atr.attributeName}"`, error);
    }
  }
});
