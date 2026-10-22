import { fetchLinkedContentSummariesPayload, headerData, logger, urlData } from "../../../path.js";

export async function fetchLinkedContentSummariesApi(request, jwt, offset, max) {
    try {
        const response = await request.post(urlData.fetchLinkedContentSummariesUrl, {
            data: fetchLinkedContentSummariesPayload(offset, max),
            headers: headerData.createLinkedContentPayloadHeaders(
                jwt,
                "application/json",
            ),
        });

        if (response.status() !== 200) {
            logger.error(`Failed to fetch linked content summaries: Status ${response.status()}`);
            return null;
        }

        const responseData = await response.json();
        logger.info(`Fetched ${responseData.contentItems?.length || 0} content items (total: ${responseData.totalCount})`);
        
        return responseData;
    } catch (error) {
        logger.error(`Error fetching linked content summaries: ${error.message}`);
        return null;
    }
}


export async function fetchAllLinkedContentSummaries(request, jwt, pageSize = 100) {
    const allContentItems = [];
    let offset = 0;
    let totalCount = 0;

    try {
        do {
            const response = await fetchLinkedContentSummariesApi(request, jwt, offset, pageSize);
            
            if (!response || !response.contentItems) {
                break;
            }

            allContentItems.push(...response.contentItems);
            totalCount = parseInt(response.totalCount, 10);
            offset += pageSize;

        } while (allContentItems.length < totalCount);

        logger.info(`Fetched all ${allContentItems.length} linked content items`);
        return allContentItems;
    } catch (error) {
        logger.error(`Error fetching all linked content summaries: ${error.message}`);
        return allContentItems;
    }
}

export async function getContentUuidsByTitles(request, jwt, titles) {
    const result = {};
    
    try {
        const allContent = await fetchAllLinkedContentSummaries(request, jwt);
        
        for (const title of titles) {
            const matchingContent = allContent.find(
                (item) => item.title.toLowerCase() === title.toLowerCase()
            );

            if (matchingContent) {
                result[title] = matchingContent.linkedContentUuid;
                logger.info(`Found "${title}" -> ${matchingContent.linkedContentUuid}`);
            } else {
                result[title] = null;
                logger.warn(`Content "${title}" not found in child site`);
            }
        }

        const foundCount = Object.values(result).filter(uuid => uuid !== null).length;
        logger.info(`Content UUIDs resolved: ${foundCount}/${titles.length}`);
        
        return result;
    } catch (error) {
        logger.error(`Error getting content UUIDs by titles: ${error.message}`);
        return result;
    }
}
