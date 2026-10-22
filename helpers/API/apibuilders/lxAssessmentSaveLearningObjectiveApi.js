import {
    headerData,
    urlData,
    expect,
    logger,
    lxAssessmentSaveLearningObjectivePayload,
} from "../../../path.js";

// Updated lxAssessmentSaveLearningObjectiveApi to return all uuids in an array
export async function lxAssessmentSaveLearningObjectiveApi(
    request,
    token,
    description,
    internalAssessmentId,
    assessmentContainerId
) {
    try {
         let headers = headerData.lxAssessmentSaveLearningObjectiveHeaders(token, "application/json");
        let payload = lxAssessmentSaveLearningObjectivePayload(
            description,
            internalAssessmentId,
            assessmentContainerId
        );

        let resp = await request.post(urlData.lxAssessmentSaveLearningObjectiveUrl, {
            data: payload,
            headers: headers,
        });

        expect(resp.status()).toBe(201);
        let response = await resp.json();
        logger.info(`Learning objectives saved successfully for assessment: ${internalAssessmentId}`);

        if (
            response?.learningObjectives &&
            Array.isArray(response.learningObjectives)
        ) {
            let uuids = response.learningObjectives.map(obj => obj.id);
            logger.info(`Extracted ${uuids.length} learning objective UUIDs`);
            return uuids;
        }
        return [];
    } catch (error) {
        logger.error(`Failed to save learning objectives due to error: ${error}`);
        throw error;
    }
}


