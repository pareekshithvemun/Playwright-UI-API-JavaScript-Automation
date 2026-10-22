import { headerData, expect, s3UploadPayload, logger } from "../../../path.js";


export async function s3UploadApi(request, uploadUrl, uploadFields, filePath) {
  try {
    // Build form-data fields with signed values + file
    const formDataFields = s3UploadPayload(uploadFields, filePath);

    // Upload file directly to S3
    const res = await request.post(uploadUrl, {
      multipart: formDataFields,
    });

    expect(res.status()).toBe(204); // S3 returns 204 No Content on success
    logger.info(`✅ Successfully uploaded file to S3`);
    return res;
  } catch (error) {
    logger.error(`❌ Failed to upload file to S3: ${error}`);
    throw error;
  }
}
