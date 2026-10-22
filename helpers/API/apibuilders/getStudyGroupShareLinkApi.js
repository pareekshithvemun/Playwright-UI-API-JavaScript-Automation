import { headerData, urlData, expect, logger, getStudyGroupshareLinkPayload } from "../../../path";

export async function getStudyGroupShareLinkApi(request, token, studyGroupId) {
    try {
        let headersOfShareLink = headerData.createStudyGroupHeaders(
            token,
            "application/json"
        );

        let respOfShareLink = await request.post(urlData.getStudyGroupShareLink, {
            data: getStudyGroupshareLinkPayload(studyGroupId),
            headers: headersOfShareLink,
        });

        expect(respOfShareLink.status()).toBe(200);
        const resp = await respOfShareLink.json();
        const shareLink =
            resp?.[0]?.data?.shareLinkByUrl?.shareLinkByUrl || null;
        if (!shareLink) {
            logger.info(
                `Share link API did not return a shareLink. Full response: ${JSON.stringify(
                    resp
                )}`
            );
            return null;
        }

        logger.info(`Study group share link generated: ${shareLink}`);
        return shareLink;
    } catch (error) {
        logger.info(`Failed to get study group share link due to error : ${error}`);
    }
}
