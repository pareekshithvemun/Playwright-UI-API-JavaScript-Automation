import {
    headerData,
    urlData,
    expect,
    logger,
} from "../../../path.js";


export async function retireChannelApi(request, jwt, channelId) {
    try {
        let headers = headerData.createCertificationPathHeaders(jwt, "application/json");
        let response = await request.put(urlData.retireCertificationPathUrl(channelId), {
            headers,
        });

        expect(response.status()).toBe(200);
        logger.info(`Successfully retired channel with ID: ${channelId}`);
        return await response.json();
    } catch (error) {
        logger.error(`Failed to retire channel ${channelId} due to error: ${error}`);
    }
}
