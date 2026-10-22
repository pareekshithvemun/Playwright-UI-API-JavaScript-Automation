import { headerData, urlData, logger, addSkillsToJourneyPayload } from "../../../path.js";

export async function addSkillsToJourney(request, jwt, journeyUuid, skillIds) {
  try {
    const headers = headerData.addTrackToJourneyHeaders(jwt, "application/json");
    const response = await request.patch(urlData.patchJourneyUrl(journeyUuid), {
      data: addSkillsToJourneyPayload(skillIds),
      headers: headers
    });

    if (response.status() === 200) {
      logger.info(`Added ${skillIds.length} skills to journey ${journeyUuid}`);
      return true;
    } else {
      logger.error(`Failed to add skills to journey: ${response.status()}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error adding skills to journey: ${error.message}`);
    return false;
  }
}
