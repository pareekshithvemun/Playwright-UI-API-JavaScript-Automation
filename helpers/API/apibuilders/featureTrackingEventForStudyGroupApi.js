import {
  headerData,
  expect,
  logger,
  urlData,
  featureTrackingEventForStudyGroupPayload,
} from "../../../path.js";

export async function featureTrackingEventForStudyGroupApi(
  request,
  learnerToken
) {
  try {
    let headersOfFeatureTrackingEventForStudyGroup =
      headerData.featureTrackingEventForPlaylistHeaders(
        learnerToken,
        "application/json"
      ); //using same headers for both APIs
    let respOfFeatureTrackingEventForStudyGroup = await request.post(
      urlData.featureTrackingEventUrl,
      {
        data: featureTrackingEventForStudyGroupPayload(),
        headers: headersOfFeatureTrackingEventForStudyGroup,
      }
    );
    expect(respOfFeatureTrackingEventForStudyGroup.status()).toBe(200);
    const resp = await respOfFeatureTrackingEventForStudyGroup.json();
    resp.forEach((item, index) => {
      expect(item.data.featureTrackingEvent.success).toBe(true);
      logger.info(`Item ${index + 1} success: true ✅`);
    });
    return resp;
  } catch (error) {
    logger.error(
      `Failed to populate date for studygroup in Feature Usage report : ${error}`
    );
  }
}
