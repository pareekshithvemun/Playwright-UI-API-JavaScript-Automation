import {
  headerData,
  urlData,
  expect,
  logger,
  lxAssessmentSearchContentPayload,
} from "../../../path.js";

export async function lxAssessmentSearchContentApi(
  request,
  token,
  query,
  userId
) {
  try {
    let headers = headerData.lxAssessmentSearchContentHeaders(
      token,
      "application/json",
      urlData.Org_ID,
      userId
    );
    let payload = lxAssessmentSearchContentPayload(query);

    let resp = await request.post(urlData.lxAssessmentSearchContentUrl, {
      data: payload,
      headers: headers,
    });

    expect(resp.status()).toBe(200);
    let response = await resp.json();
    let results = response?.data?.search?.results || [];
    logger.info(`Search completed for query: "${query}", resultCount: ${results.length}`);
    return results;
  } catch (error) {
    logger.error(`Failed to search content for query: "${query}" due to error: ${error}`);
    throw error;
  }
}
