export function userGoalsPayload(duration) {
    return [
        {
            "operationName": "userGoalsAndStreaksNewGoal",
            "variables": {
                "newGoal": duration
            },
            "query": "mutation userGoalsAndStreaksNewGoal($newGoal: Int!) {\n  setNewGoalForUser(newGoal: $newGoal) {\n    success\n    message\n    __typename\n  }\n}\n"
        }
    ]
}