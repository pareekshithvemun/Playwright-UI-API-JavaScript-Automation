import fs from 'fs';

export function s3UploadPayload(uploadFields, filePath) {
  // uploadFields should contain: key, bucket, X-Amz-Algorithm, X-Amz-Credential, 
  // X-Amz-Date, X-Amz-Security-Token, Policy, X-Amz-Signature

  const formData = {
    ...uploadFields,
    file: fs.createReadStream(filePath)  // ✅ attach the file itself, not just path
  };

  return formData;
}
