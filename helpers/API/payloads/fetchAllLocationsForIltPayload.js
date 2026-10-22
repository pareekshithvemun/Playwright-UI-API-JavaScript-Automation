/** POST /api/ucm/live-course/fetch-all-locations — matches Admin live-course UI body */
export function fetchAllLocationsForIltPayload() {
  return {
    excludeRetired: true,
  };
}
