export function createLiveClassPayload(title, liveCourseUUID, classType, meetingUrl = null, imageUrl, instructorUuid, locationUuid = null, classroomUuid = null, randomUUID) {
    if (classType == "online") {
        return {
            "title": title,
            "liveCourseUuid": liveCourseUUID,
            "status": 0,
            "timeZone": "Asia/Calcutta",
            "classType": 1,//online
            "launchURL": meetingUrl,
            "allowReg": true,
            "allowSelfWithDraw": true,
            "canJoinWaitlist": true,
            "lowEnrollmentAlert": false,
            "regDeadline": 0,
            "withdrawDeadline": 0,
            "minEnrollment": 0,
            "contactName": "",
            "phoneNumber": null,
            "email": "",
            "maxEnrollment": "30",
            "classImagePath": imageUrl,
            "learnerNotes": "<p>Learners are advised to arrive at the location 5 minutes prior to schedule.</p>",
            "classInstructions": "<p>Attendees are requested to carry notes and pen</p>",
            "contentLanguage": "en-US",
            "insCanManageRoster": true,
            "allowNotifications": false,
            "imageAltText": null,
            "instructors": [
                instructorUuid
            ],
            "locationUuid": locationUuid,
            "classroomUuid": classroomUuid,
            "customAttributes": [

            ],
            "liveSessions": [
                {
                    "endDateTime": "2024-12-31T08:30:00Z",
                    "startDateTime": "2024-12-31T07:30:00Z",
                    "liveClassUuid": randomUUID,
                    "actionType": 0
                }
            ]
        }
    }
    if (classType == "offline") {
        return {
            "title": title,
            "liveCourseUuid": liveCourseUUID,
            "status": 0,
            "timeZone": "Asia/Calcutta",
            "classType": 2,//offline
            "launchURL": meetingUrl,
            "allowReg": true,
            "allowSelfWithDraw": true,
            "canJoinWaitlist": true,
            "lowEnrollmentAlert": false,
            "regDeadline": 0,
            "withdrawDeadline": 0,
            "minEnrollment": 0,
            "contactName": "",
            "phoneNumber": null,
            "email": "",
            "maxEnrollment": "30",
            "classImagePath": imageUrl,
            "learnerNotes": "<p>Learners are advised to arrive at the location 5 minutes prior to schedule.</p>",
            "classInstructions": "<p>Attendees are requested to carry notes and pen</p>",
            "contentLanguage": "en-US",
            "insCanManageRoster": true,
            "allowNotifications": false,
            "imageAltText": null,
            "instructors": [
                instructorUuid
            ],
            "locationUuid": locationUuid,
            "classroomUuid": classroomUuid,
            "customAttributes": [

            ],
            "liveSessions": [
                {
                    "endDateTime": "2024-12-31T09:30:00Z",
                    "startDateTime": "2024-12-31T08:30:00Z",
                    "liveClassUuid": randomUUID,
                    "actionType": 0
                }
            ]
        }
    }
    if (classType == "hybrid") {
        return {
            "title": title,
            "liveCourseUuid": liveCourseUUID,
            "status": 0,
            "timeZone": "Asia/Calcutta",
            "classType": 3,//hybrid
            "launchURL": meetingUrl,
            "allowReg": true,
            "allowSelfWithDraw": true,
            "canJoinWaitlist": true,
            "lowEnrollmentAlert": false,
            "regDeadline": 0,
            "withdrawDeadline": 0,
            "minEnrollment": 0,
            "contactName": "",
            "phoneNumber": null,
            "email": "",
            "maxEnrollment": "30",
            "classImagePath": imageUrl,
            "learnerNotes": "<p>Learners are advised to arrive at the location 5 minutes prior to schedule.</p>",
            "classInstructions": "<p>Attendees are requested to carry notes and pen</p>",
            "contentLanguage": "en-US",
            "insCanManageRoster": true,
            "allowNotifications": false,
            "imageAltText": null,
            "instructors": [
                instructorUuid
            ],
            "locationUuid": locationUuid,
            "classroomUuid": classroomUuid,
            "customAttributes": [

            ],
            "liveSessions": [
                {
                    "endDateTime": "2024-12-31T10:30:00Z",
                    "startDateTime": "2024-12-31T09:30:00Z",
                    "liveClassUuid": randomUUID,
                    "actionType": 0
                }
            ]
        }
    }
}