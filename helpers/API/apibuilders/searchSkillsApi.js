import { headerData, urlData, logger } from "../../../path.js";


export async function searchSkillsApi(request, jwt, searchText, locale = "en-US") {
    try {
        const headers = {
            Authorization: `Bearer ${jwt}`,
            Accept: "application/json"
        };
        const params = new URLSearchParams({ text: searchText, locale });
        const url = `${urlData.searchSkillsUrl}?${params}`;

        const response = await request.get(url, { headers });

        if (response.status() !== 200) {
            logger.error(`Skills search failed for "${searchText}": Status ${response.status()}`);
            return [];
        }

        const responseData = await response.json();
        logger.info(`Found ${responseData.length || 0} skills matching "${searchText}"`);
        
        return responseData;
    } catch (error) {
        logger.error(`Error searching skills: ${error.message}`);
        return [];
    }
}


export async function getSkillIdsByNames(request, jwt, skillNames) {
    const skillIds = [];

    for (const skillName of skillNames) {
        const results = await searchSkillsApi(request, jwt, skillName);
        
        if (results && results.length > 0) {
            // Find exact match or closest match
            const exactMatch = results.find(
                (skill) => skill.name.toLowerCase() === skillName.toLowerCase()
            );
            
            if (exactMatch) {
                skillIds.push(exactMatch.id);
                logger.info(`Found skill "${skillName}" with ID: ${exactMatch.id}`);
            } else {
                logger.warn(`No exact match found for skill "${skillName}"`);
            }
        } else {
            logger.warn(`No skill found for "${skillName}"`);
        }
    }

    return skillIds;
}
