let areas;
let subjects;

function setAreaData(value) {
  areas = value;
}

function getAreaData() {
  return areas;
}

function setSubjectData(value) {
  subjects = value;
}

function getSubjectData() {
  return subjects;
}

export let areaAndSubjectdata = {
  setAreaData,
  getAreaData,
  setSubjectData,
  getSubjectData,
};
