import {
  headerData,
  expect,
  logger,
  urlData,
  featureTrackingEventForPlaylistPayload,
} from "../../../path.js";

export async function featureTrackingEventForPlaylistApi(
  request,
  learnerToken
) {
  try {
    let headersOfFeatureTrackingEventForPlaylist =
      headerData.featureTrackingEventForPlaylistHeaders(
        learnerToken,
        "application/json"
      );
    let respOfFeatureTrackingEventForPlaylist = await request.post(
      urlData.featureTrackingEventUrl,
      {
        data: featureTrackingEventForPlaylistPayload(),
        headers: headersOfFeatureTrackingEventForPlaylist,
      }
    );
    expect(respOfFeatureTrackingEventForPlaylist.status()).toBe(200);
    const resp = await respOfFeatureTrackingEventForPlaylist.json();
    resp.forEach((item, index) => {
      expect(item.data.featureTrackingEvent.success).toBe(true);
      logger.info(`Item ${index + 1} success: true ✅`);
    });
    return resp;
  } catch (error) {
    logger.error(
      `Failed to populate date for playlists in Feature Usage report : ${error}`
    );
  }
}
