import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { changeSubjContent } from "../../API/payloads/removedatafromsubjectspayload.js";
import { logger } from "../../../logger.js";

export async function editSubjectConetent(request, jwt, subuuid, areaUuid) {
  try {
    let headersOfeditSubJectContent = headerData.customiseSubjHeaders(
      jwt,
      "application/json"
    );
    let responseOfeditSubJectContent = await request.put(
      urlData.customSubJectUrl(subuuid),
      {
        data: changeSubjContent(areaUuid),
        headers: headersOfeditSubJectContent,
      }
    );
    expect(responseOfeditSubJectContent.status()).toBe(200);
    const resp = await responseOfeditSubJectContent.json();
    if (resp["message"] === "subject updated") {
      logger.info(
        `Content has been updated in the subject: ${subuuid} which is in area: ${areaUuid}`
      );
    }
  } catch (error) {
    logger.info(
      `Failed to update content in the  subject ${subuuid} which is in area: ${areaUuid} due to error: ${error}`
    );
  }
}
