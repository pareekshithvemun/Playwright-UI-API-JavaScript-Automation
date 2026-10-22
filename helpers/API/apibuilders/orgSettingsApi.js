import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { orgSettingsPayLoad } from "../payloads/orgsettingPayload.js";
import { logger } from "../../../logger.js";

export async function orgSettingsApi(
  request,
  jwt,
  LiveCourseVisibility,
  BenchmarkCompletionIntervalInDays,
  percentageOfAssessmentRequiredForCourseCompletion,
  nameOfCustomAreaSection
) {
  try {
    let headerOforgSettingsApi = headerData.orgSettingsHeaders(
      jwt,
      "application/json"
    );
    let respoforgSettingsApi = await request.patch(urlData.orgSettingsUrl, {
      data: orgSettingsPayLoad(
        LiveCourseVisibility,
        BenchmarkCompletionIntervalInDays,
        percentageOfAssessmentRequiredForCourseCompletion,
        nameOfCustomAreaSection
      ),
      headers: headerOforgSettingsApi,
    });
    expect(respoforgSettingsApi.status()).toBe(200);
    const resp = await respoforgSettingsApi.json();
    return resp;
  } catch (error) {
    logger.error(
      `Failed to edit Org Setting due to error: ${error}`
  );  
  }
}
