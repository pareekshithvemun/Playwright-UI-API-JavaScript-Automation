import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { createStripBody } from "../../API/payloads/createstrippayload.js";
import { logger } from "../../../logger.js";

export async function createStrip(request, jwt,audName,TitleOfStrip,contentOfStrip,durationOfStrip,locale) {
  
    let headerofstripCreation = headerData.stripgenerationHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.createStripUrl, {
      data: await createStripBody(
        TitleOfStrip,
        contentOfStrip,
        durationOfStrip,request,jwt,audName,
        locale
      ),
      headers: headerofstripCreation,
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`strip has been created with uuid:${resp["stripUuid"]}`);
  
}
