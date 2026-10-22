// Completes AI Coach onboarding; job_role is the name from search, not a uuid.
export function aiCoachClientProfilePayload(profile) {
  return {
    user_id: profile.userId,
    client_id: profile.clientId,
    job_role: profile.jobRoleName,
    key_responsibilities: profile.keyResponsibilities,
    career_aspiration: profile.careerAspiration,
    motivation: profile.motivation,
  };
}

// PUT body is answers only; question ids come from GET, never from testData.
export function aiCoachSelfAssessmentPayload(answers) {
  return { answers };
}

// One skill per goal; percipio_uuid is from API 9 match-by-name.
export function aiCoachGoalPayload(title, skillId, skillName) {
  return {
    title,
    goal_skill_ids: [{ percipio_uuid: skillId, name: skillName }],
  };
}

// Task due dates must be future YYYY-MM-DD or the create call fails.
export function aiCoachGoalTasksPayload(tasks) {
  return tasks;
}

// Completing every task still does not achieve the goal; that needs a separate PATCH.
export function aiCoachTaskStatusPayload() {
  return { status: "completed" };
}

// Status must be achieved, not completed.
export function aiCoachGoalStatusPayload() {
  return { status: "achieved" };
}

// Weekly 60-minute session for full default users only; local time has no offset.
export function aiCoachCoachingSessionPayload(session) {
  return {
    scheduled_at_local: session.scheduledAtLocal,
    scheduling_timezone: session.timezone,
    duration_minutes: 60,
    recurrence: "weekly",
    recurrence_weekday: session.weekday,
    recurrence_end_date: session.endDate,
  };
}

// First turn uses launch_id null; later turns reuse the id from the stream or GET launches.
export function aiCoachChatStreamPayload(chat) {
  const body = {
    text: chat.text ?? "",
    launch_id: chat.launchId ?? null,
    recent_messages: chat.recentMessages || [],
    page_context: chat.pageContext || { route_id: "chat_free", entry_trigger: "page_open" },
  };
  if (chat.clientAction) {
    body.client_action = chat.clientAction;
  }
  return body;
}

// Block id is a new uuid, not the launch id. Times drive average conversation time.
export function aiCoachEngagementBlockPayload(block) {
  return {
    id: block.id,
    started_at: block.startedAt,
    last_activity_at: block.lastActivityAt,
    ended_at: block.endedAt,
    surfaces: ["chat"],
    close_reason: block.closeReason || "session_reset",
  };
}
