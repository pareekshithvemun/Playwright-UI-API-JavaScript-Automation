import { headerData } from "../headers/allHeaders.js";

/**
 * GET license-pool-set-rules. Paginate by calling with query params max & offset on urlData.getLicensePoolSetRulesUrl.
 */
export async function getLicensePoolSetRules(request, url, token) {
  const response = await request.get(url, {
    headers: headerData.getallLicencePoolHeaders(token),
  });
  return response;
}
