import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getCertificationPathSubjectsApi(
  request,
  jwt,
  journeyUUID
) {
  try {
    let headerofGetSubjectsforCertification =
      headerData.getCertificationSubjectsHeaders(jwt, "application/json");
    let resofGetSubjects = await request.get(
      urlData.getCertificationSubjectsUrl(journeyUUID),
      {
        headers: headerofGetSubjectsforCertification,
      }
    );
    expect(resofGetSubjects.status()).toBe(200);
    const resp = await resofGetSubjects.json();
    return resp;
  } catch (error) {
    logger.info(`Failed to get subjects from Org due to error : ${error}`);
  }
}
