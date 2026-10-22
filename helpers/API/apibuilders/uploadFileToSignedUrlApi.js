import fs from "fs";
import { logger } from "../../../logger.js";

export async function uploadFileToSignedUrl(
  request,
  signedUploadUrl,
  filePath,
  contentType = "application/pdf"
) {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const response = await request.put(signedUploadUrl, {
      headers: {
        "Content-Type": contentType,
      },
      data: fileBuffer,
    });

    const status = response.status();

    if (status === 200) {
      logger.info(
        `File uploaded successfully to signed URL. Status: ${status}`
      );
    } else {
      logger.error(`File upload failed with status: ${status}`);
    }
    return status;
  } catch (error) {
    logger.error(
      `File upload to signed URL failed due to error: ${error.message}`
    );
  }
}
