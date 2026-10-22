import ExcelHelperAndDataGenerator from "../../Excel/testdataofCreateuser";

const time = ExcelHelperAndDataGenerator.timeUsedinAssignCreation;


export async function createAssignPayload(
  content,
  businessObjectiveID,
  assignMentName,
  audid,
  assignDurtionInDays,
  assignMentState,
  assGoal,
  userID,
  description
) {

  return {
    userUuids: [],
    audienceUuids: audid,
    contents: content,
    businessObjectiveUuid: businessObjectiveID,
    description: description,
    name: assignMentName,
    startDate: time,
    daysToComplete: assignDurtionInDays,
    isContentOrderRequired: false,
    enableEquivalency: true,
    customEmailMessage: "Please complete the assignment before due Date",
    emailScheduledAt: time,
    sendAssignmentEmail: false,
    isRetakeRequired: false,
    timezone: "UTC",
    createdBy: userID,
    isEmailRequired: false,
    action: assignMentState,
    category: assGoal,
  };
}
