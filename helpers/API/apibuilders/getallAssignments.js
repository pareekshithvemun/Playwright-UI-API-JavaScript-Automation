import { headerData, urlData, expect, logger, getAllAssignmentsBody } from "../../../path.js";

export async function getAllAssignmentsApi(request, jwt, searchOptions = null) {
  try {
    const headerofgetAllAssignmentHeader = headerData.getAllAssignmentsHeader(
      jwt,
      "application/json",
    );

    const body = getAllAssignmentsBody();
    if (searchOptions) {
      body.q = searchOptions.q ?? "";
    }

    let resofgetAllAssignmentsApi = await request.post(urlData.getAllAssignments, {
      data: body,
      headers: headerofgetAllAssignmentHeader,
    });
    expect(resofgetAllAssignmentsApi.status()).toBe(200);
    const resp = await resofgetAllAssignmentsApi.json();
    logger.info(`Successfully fetched all assignment data`);
    return resp;
  } catch (error) {
    logger.error(`Failed to get all assignments from Org due to error : ${error}`);
  }
}
