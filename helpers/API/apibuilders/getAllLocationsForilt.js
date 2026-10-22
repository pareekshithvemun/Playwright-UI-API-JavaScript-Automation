import { expect, fetchAllLocationsForIltPayload, headerData, logger, urlData } from "../../../path.js";

export async function getAllLocationsForiltApi(request,jwt) {
    try {
        let headerofGetAllLocationsForilt = headerData.getLocationsForIltHeaders(
          jwt,
          "application/json",
        );
        let resofGetAllLocationsForilt = await request.post(urlData.getAllLocationsForIltUrl, {
          headers: headerofGetAllLocationsForilt,
          data: fetchAllLocationsForIltPayload(),
        });
        const resp = await resofGetAllLocationsForilt.json();
        expect(resofGetAllLocationsForilt.status()).toBe(200);
        return resp;
      } catch (error) {
        logger.info(`Failed to get all locations of ILT from Org due to error : ${error}`);
      }
}
 