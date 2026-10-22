import {
  headerData,
  urlData,
  expect,
  logger,
  publishCourseAiContentGenPayload,
} from "../../../path.js";

export async function publishCourseAiContentGenApi(request, jwt, contentId) {
  const headers = headerData.aiContentGenContentMetadataHeaders(jwt, contentId);
  const payload = publishCourseAiContentGenPayload();
  const url = urlData.getAiContentGenPublishUrl(contentId);

  const res = await request.post(url, {
    data: payload,
    headers,
  });

  const status = res.status();
  if (status !== 200) {
    logger.error(
      `publishCourseAiContentGenApi: HTTP ${status} url=${url} contentId=${contentId} body=${await res.text()}`,
    );
  }

  expect(status).toBe(200);
  const resp = await res.json();

  expect(resp.success).toBe(true);
  if (resp.data?.message) {
    expect(resp.data.message).toContain("queued successfully");
  }
  logger.info(
    `Course published successfully: content ${contentId}${resp.data?.message ? ` - ${resp.data.message}` : ""}`,
  );
  return resp;
}
