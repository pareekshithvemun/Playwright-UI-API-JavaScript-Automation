import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";


export async function fetchContentUUIDUsingNameApi(request,jwt) {
    try {
        let headeroffetchContentUUIDUsingNameApi= headerData.fetchContentUUIDHeaders(jwt)
        let resoffetchContentUUIDUsingNameApi = await request.get(urlData.fetchContentUUIDUrl, {
          headers: headeroffetchContentUUIDUsingNameApi,
        });
        expect(resoffetchContentUUIDUsingNameApi.status()).toBe(200);
        const resp = await resoffetchContentUUIDUsingNameApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get response due to error : ${error}`);
      }
}
 