let allids;
let csids;

function setAllplayListIds(value) {
  allids = value;
}

function getAllplayListIds() {
  return allids;
}

function setCurrentSessionplayListIds(value) {
  csids = value;
}

function getCurrentSessionplayListIds() {
  return csids;
}

export let dataOfplayList = {
  setAllplayListIds,
  getAllplayListIds,
  setCurrentSessionplayListIds,
  getCurrentSessionplayListIds,
};
