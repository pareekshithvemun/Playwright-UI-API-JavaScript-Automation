import { headerData, urlData, expect, logger, getvideoIdFromCourseIdBody } from "../../../path.js";

export async function getvideoIdFromCourseIdApi(request, jwt, courseId) {
  try {
    let headers = headerData.getvideoIdFromCourseIdHeaders(
      jwt,
      "application/json",
    );
    let res = await request.post(urlData.getVideoIdFromCourseIdUrl, {
      data: getvideoIdFromCourseIdBody(courseId),
      headers: headers,
    });

    expect(res.status()).toBe(200);
    let response = await res.json();

    return response;
  } catch (error) {
    logger.error(
      `Failed to get video ID from course ID: ${courseId} due to error ${error}`,
    );
  }
}
