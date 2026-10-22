export function createClassroomPayload(name, locationUuid) {
    return {
        "name": name,
        "capacity": 30,
        "locationUuid": locationUuid
    }
}