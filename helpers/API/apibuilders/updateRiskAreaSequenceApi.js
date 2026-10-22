import {
  headerData,
  urlData,
  updateRiskAreaSequencePayload,
  expect,
  logger,
} from "../../../path.js";

export async function updateRiskAreaSequenceApi(
  request,
  jwt,
  orgUUID,
  orgRiskAreasSeq,
  locale = "en-US",
) {
  try {
    const response = await request.post(urlData.updateRiskAreaSequenceUrl, {
      data: updateRiskAreaSequencePayload(orgUUID, orgRiskAreasSeq, locale),
      headers: headerData.updateRiskAreaSequenceHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const updatedRiskAreas =
      responseBody?.[0]?.data?.updateRiskAreaSequence ||
      responseBody?.data?.updateRiskAreaSequence ||
      [];

    logger.info(
      `Updated risk area sequence for ${updatedRiskAreas.length} risk areas`,
    );
    return { success: true, riskAreas: updatedRiskAreas };
  } catch (error) {
    logger.error(`Failed to update risk area sequence: ${error.message}`);
    throw error;
  }
}
