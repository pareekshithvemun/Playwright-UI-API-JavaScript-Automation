import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { saveQestionPayload } from "../payloads/saveQuestionPayload.js";

export async function saveQuestionApi(
  request,
  jwt,
  containerId,
  adminId,
  parentId,
  answerStructureObject,
  questionOrder,
  questionText,
  selectType,
  displayType,
  subType,
  locale

) {
  try {
    let headersofsavequestion = headerData.saveQuestionHeader(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.saveQuestionUrl, {
      headers: headersofsavequestion,
      data: saveQestionPayload(
        containerId,
        adminId,
        parentId,
        answerStructureObject,
        questionOrder,
        questionText,
        selectType,
        displayType,
        subType,
        locale

      ),
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(resp.message);
    return resp;
  } catch (error) {
    logger.error(`Failed to create question due to error: ${error}`);
  }
}
