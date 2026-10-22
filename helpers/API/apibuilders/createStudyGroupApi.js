import {
    headerData,
    urlData,
    expect,
    logger,
    createStudyGroupPayload
} from "../../../path.js";

export async function createStudyGroupApi(request, token, title, assetId, assetType) {
    try {
        let headersOfGroupChallenge = headerData.createStudyGroupHeaders(
            token,
            "application/json"
        );

        let respOfGroupChallenge = await request.post(urlData.createStudyGroupUrl, {
            data: createStudyGroupPayload(title, assetId, assetType),
            headers: headersOfGroupChallenge,
        });

        expect(respOfGroupChallenge.status()).toBe(200);
        const resp = await respOfGroupChallenge.json();
        const challengeId = resp?.data?.lgcCreateChallenge?.id;


        if (!challengeId) {
            logger.info(`Study group creation did not return an ID. Full response: ${JSON.stringify(resp)}`);
            return null;
        }
        logger.info(`Study group is created with id: ${challengeId}`);
        return challengeId;

    } catch (error) {
        logger.info(`Failed to create study group due to error : ${error}`);
    }
}
