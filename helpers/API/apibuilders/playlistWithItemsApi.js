import {
  headerData,
  urlData,
  playlistWithItemsPayload,
  expect,
  logger,
} from "../../../path.js";

export async function playlistWithItemsApi(request, jwt, playlistId) {
  try {
    const response = await request.post(urlData.playlistWithItemsUrl, {
      data: playlistWithItemsPayload(playlistId),
      headers: headerData.getplayListHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    logger.info(`Fetched items for playlist ${playlistId}`);
    return responseData[0].data.playlistWithItems;
  } catch (error) {
    logger.error(`Failed to get playlist items due to ${error}`);
    return null;
  }
}
