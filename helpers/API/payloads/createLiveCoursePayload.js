export function createLiveCoursePayload(title, description,additionalNotes,locationUuid,classroomUuid,imageUrl) {
    return {
        "title": title,
        "description": `<p>${description}</p>`,
        "contentLanguage": "en-US",
        "duration": 3600,
        "externalId": "",
        "courseImagePath": imageUrl,
        "learnerNotes": `<p>${additionalNotes}</p>`,
        "minEnrollment": 0,
        "approvalType": "0",
        "allowReg": true,
        "allowSelfWithDraw": true,
        "canJoinWaitlist": true,
        "lowEnrollmentAlert": false,
        "regDeadline": 0,
        "withdrawDeadline": 0,
        "contactName": "",
        "email": "",
        "phoneNumber": "",
        "status": 0,
        "source": "Learning and Development",
        "technologyTitle": "",
        "technologyVersion": "",
        "insCanManageRoster": true,
        "locationUuid": locationUuid,
        "classroomUuid": classroomUuid,
        "instructors": []
    }

}