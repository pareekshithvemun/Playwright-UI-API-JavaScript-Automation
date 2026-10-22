import { urlData } from "../url/allUrls.js";
export function tokenGeneratorApipayload(userName, Password) {
  return {
    login: userName,
    password: Password,
    organizationId: urlData.Org_ID,
  };
}
