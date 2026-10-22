export function getJobStatusCaisyPayload(jobId) {
  return {
    operationName: "getJobStatus",
    variables: {
      jobId: jobId,
    },
    query: `query getJobStatus($jobId: ID) {
      getJobStatus(jobId: $jobId) {
        jobId
        jobStatus
        scenarioId
      }
    }`,
  };
}


