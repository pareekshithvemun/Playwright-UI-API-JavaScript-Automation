import {
  urlData,
  headerData,
  expect,
  logger,
  publishAssessmentPayload,
  getAssessmentApi,
  getAssessmentQuestionsApi,
  buildAssessmentContentPublishDetails,
} from "../../../path.js";

/**
 * Publish assessment via lx-studio publishContent GraphQL.
 * When contentPublishDetails is omitted, builds it from getAssessment + getAssessmentQuestions.
 * Built payload: invokerUuid = admin/user id (pass from spec, e.g. getAdminUserId);
 * ownerUuid and organizationUuid = org id (from getAssessment response).
 *
 **/
export async function publishAssessmentApi(
  request,
  token,
  assessmentContainerId,
  assessmentId,
  invokerUuid,
  uuidMappingResponse,
  contentPublishDetails,
) {
  try {
    const hasContentPublishDetails =
      contentPublishDetails &&
      typeof contentPublishDetails === "object" &&
      contentPublishDetails.content;
    let publishDetails = hasContentPublishDetails
      ? contentPublishDetails
      : null;

    if (!publishDetails) {
      if (!assessmentId) {
        throw new Error(
          "publishAssessmentApi: assessmentId is required when contentPublishDetails is not provided",
        );
      }
      const getAssessmentResponse = await getAssessmentApi(
        request,
        token,
        assessmentId,
        assessmentContainerId,
      );
      const questionsResponse = await getAssessmentQuestionsApi(
        request,
        token,
        assessmentContainerId,
        assessmentId,
      );
      publishDetails = buildAssessmentContentPublishDetails(
        getAssessmentResponse,
        questionsResponse,
        {
          invokerUuid,
          contentContainerId: assessmentContainerId,
        },
        uuidMappingResponse,
      );
    }

    const url = urlData.lxStudioGraphQLUrl;
    const headers = headerData.lxStudioGraphqlHeaders(
      token,
      "application/json",
    );
    const payload = publishAssessmentPayload(
      assessmentContainerId,
      publishDetails,
    );

    const resp = await request.post(url, {
      headers,
      data: payload,
    });

    expect(resp.status()).toBe(200);
    const response = await resp.json();
    const result = response.data?.publishContent;

    if (!result) {
      throw new Error(
        `Invalid publish assessment response: ${JSON.stringify(response)}`,
      );
    }
    if (result.error) {
      throw new Error(`publishContent error: ${result.error}`);
    }
    if (!result.success) {
      throw new Error(
        `publishContent success=false: ${JSON.stringify(result.data)}`,
      );
    }

    const message =
      result.data?.message || result.data?.quickPublish?.data?.message;
    logger.info(
      `Assessment published: container ${assessmentContainerId}, success ${result.success}${message ? `, ${message}` : ""}`,
    );
    return response;
  } catch (error) {
    logger.error(`Failed to publish LX Assessment: ${error.message}`);
    throw error;
  }
}
