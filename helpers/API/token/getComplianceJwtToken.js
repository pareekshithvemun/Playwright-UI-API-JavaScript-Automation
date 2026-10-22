import { headerData, urlData, expect, logger, generateToken } from "../../../path.js";

/**
 * Compliance JWT for content-player-settings APIs (completion criteria).
 *
 * 1) GET nativeCompletionSettingLink → { "url": "https://.../launch?token=<launch-token>" }
 * 2) POST client/auth/bearer with launch token → plain JWT text (201), e.g. eyJhbGciOiJIUzI1Ni...
 */

function getLaunchTokenFromSettingLinkUrl(launchUrl) {
  const launchToken = new URL(launchUrl).searchParams.get("token");
  if (!launchToken) {
    throw new Error("Launch token missing from nativeCompletionSettingLink url");
  }
  return launchToken;
}

export async function getComplianceJwtToken(request) {
  try {
    const adminJwt = await generateToken(request);

    const linkResponse = await request.get(urlData.nativeCompletionSettingLinkUrl, {
      headers: headerData.orgSettingsHeaders(adminJwt, "application/json"),
    });
    expect(linkResponse.status()).toBe(200);

    const { url: launchUrl } = await linkResponse.json();
    if (!launchUrl) {
      throw new Error("nativeCompletionSettingLink response missing url");
    }

    const launchToken = getLaunchTokenFromSettingLinkUrl(launchUrl);

    const bearerResponse = await request.post(
      urlData.contentPlayerSettingsAuthBearerUrl,
      {
        headers: {
          Authorization: `Bearer ${launchToken}`,
        },
      },
    );
    expect(bearerResponse.status()).toBe(201);

    const complianceJwt = (await bearerResponse.text()).trim();
    if (!complianceJwt.startsWith("eyJ")) {
      throw new Error("client/auth/bearer did not return a JWT");
    }

    logger.info("Compliance JWT generated for completion-criteria APIs");
    return complianceJwt;
  } catch (error) {
    logger.error(`Failed to generate compliance JWT: ${error.message}`);
    throw error;
  }
}
