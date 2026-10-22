import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function deleteAssignmentsApi(request, jwt, assignID) {
  try {
    let deleteAssignmentsHeaders = headerData.deleteAssignmentHeader(jwt);
    let resofdeleteAssignmentsApi = await request.delete(
      urlData.deleteAssignmentUrl(assignID),
      {
        headers: deleteAssignmentsHeaders,
      },
    );
    expect(resofdeleteAssignmentsApi.status()).toBe(200);
    const resp = await resofdeleteAssignmentsApi.json();
    logger.info(`${assignID} has been deleted`);
    return resp;
  } catch (error) {
    logger.error(
      `Failed to delete assignment ${assignID}  due to error : ${error}`,
    );
  }
}
