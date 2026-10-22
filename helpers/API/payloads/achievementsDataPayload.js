import reusableFunctions from "../../UI/commonFunctions.js";

export function achievementsDataPayload(){
    return [
        {
            "operationName": "dwExecDashboardAchievementByOrg",
            "variables": {
                "startDate": reusableFunctions.generateTime(0).firstDateOfMonth,
                "endDate": reusableFunctions.generateTime(0).lastDateOfMonth,
                "dateRange": "custom",
                "audienceUuids": null
            },
            "query": "query dwExecDashboardAchievementByOrg($startDate: Date!, $endDate: Date!, $dateRange: String!, $audienceUuids: [ID]) {\n  dwExecDashboardAchievementByOrg(\n    startDate: $startDate\n    endDate: $endDate\n    dateRange: $dateRange\n    audienceUuids: $audienceUuids\n    minGraphPoints: 6\n  ) {\n    totalRange {\n      data1\n      data2\n      data3\n      __typename\n    }\n    monthly {\n      date\n      data1\n      data2\n      data3\n      __typename\n    }\n    __typename\n  }\n}\n"
        }
    ]
}