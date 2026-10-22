import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { patchSubjectstoCertificationPayload } from "../payloads/patchSubjectstoCertificationPayload.js";

export async function patchSubjectstoCertificationPathApi(
  request,
  jwt,
  channelUuid,
  subjectsData
) {
  try {
    let headerDataofpatchSubjectstoCertificationPath =
      headerData.patchSubjectstoCertificationPath(jwt, "application/json");
    let res = await request.patch(
      urlData.patchSubjectstoCertificationPathUrl(channelUuid),
      {
        data: patchSubjectstoCertificationPayload(subjectsData),
        headers: headerDataofpatchSubjectstoCertificationPath,
      }
    );
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(resp.message);
  } catch (e) {
    logger.info(
      `Failed to update subjects of certification path due to an error:${e}`
    );
  }
}
