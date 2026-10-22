export function getAllAssignmentsBody() {
  return {
    offset: 0,
    page: 0,
    q: "",
    max: 300,
    filter: "",
    scopedUserUuid: null,
    category: [],
    retirementFilters: [],
  };
}
