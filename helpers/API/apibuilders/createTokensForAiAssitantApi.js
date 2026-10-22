import {
  headerData,
  urlData,
  expect,
  logger,
  generateJwtTokenPayload,
} from "../../../path.js";

export async function createTokensForAiAssitantApi(request, token) {
  try {
    let headersOfCreateTokens = headerData.generateJwtTokenHeaders(token);
    let respOfCreateTokens = await request.post(urlData.generateJwtTokenUrl, {
      data: generateJwtTokenPayload(),
      headers: headersOfCreateTokens,
    });
    expect(respOfCreateTokens.status()).toBe(200);
    let resp = await respOfCreateTokens.json();
    return resp;
  } catch (error) {
    logger.info(
      `Failed to create tokens for AI Assitant due to error : ${error}`
    );
  }
}
