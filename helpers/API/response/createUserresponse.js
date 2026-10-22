let audid;
let audName;
let assignmentName;

function setAudId(value) {
  audid = value;
}

function getAudId() {
  return audid;
}

function setAudName(value) {
  audName = value;
}

function getAudName() {
  return audName;
}

function setAssignmentName(value){
  assignmentName=value;

}

function getAssignmentName(){
  return assignmentName;

}

export let createuserdata = {
  setAudId,
  getAudId,
  setAudName,
  getAudName,
  setAssignmentName,
  getAssignmentName
};
