import {
  headerData,
  urlData,
  expect,
  logger,
  aiCoachClientProfilePayload,
  aiCoachSelfAssessmentPayload,
  aiCoachGoalPayload,
  aiCoachGoalTasksPayload,
  aiCoachTaskStatusPayload,
  aiCoachGoalStatusPayload,
  aiCoachCoachingSessionPayload,
  aiCoachChatStreamPayload,
  aiCoachEngagementBlockPayload,
} from "../../../path.js";

function learnerHeaders(learnerToken) {
  return headerData.aiCoachLearnerHeaders(learnerToken);
}

function coachingSessionHeaders(learnerToken, launchId) {
  return {
    ...learnerHeaders(learnerToken),
    Referer: urlData.aiCoachCoachingSessionsUrl.replace(
      "/api/v1/coaching-sessions",
      `/chat/${launchId}`,
    ),
  };
}

// Search is required; we take the name string for the profile PUT.
export async function getPercipioJobRolesApi(request, learnerToken, search) {
  try {
    const response = await request.get(
      `${urlData.aiCoachJobRolesUrl}?search=${encodeURIComponent(search)}`,
      { headers: learnerHeaders(learnerToken) },
    );
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error(`Could not search job roles for "${search}"`);
    throw error;
  }
}

// Reuse client_id when the profile already exists; missing profile is not a failure.
export async function getAiCoachClientProfileApi(request, learnerToken) {
  try {
    const response = await request.get(urlData.aiCoachClientProfileUrl, {
      headers: learnerHeaders(learnerToken),
    });
    if (response.status() !== 200) {
      return null;
    }
    return await response.json();
  } catch (error) {
    logger.error("Could not read this learner's AI Coach profile");
    throw error;
  }
}

// Completes the profile only; goals still need self-assessment after this.
export async function putAiCoachClientProfileApi(request, learnerToken, profile) {
  try {
    const response = await request.put(urlData.aiCoachClientProfileUrl, {
      data: aiCoachClientProfilePayload(profile),
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not save this learner's AI Coach profile");
    throw error;
  }
}

// Copy question_id and choices from here; do not hardcode assessment uuids.
export async function getAiCoachSelfAssessmentApi(request, learnerToken) {
  try {
    const response = await request.get(urlData.aiCoachSelfAssessmentUrl, {
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not load this learner's self-assessment questions");
    throw error;
  }
}

// PUT can still say in_progress; GET data is the completed flag we trust.
export async function putAiCoachSelfAssessmentApi(request, learnerToken, answers) {
  try {
    const response = await request.put(urlData.aiCoachSelfAssessmentUrl, {
      data: aiCoachSelfAssessmentPayload(answers),
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not save this learner's self-assessment answers");
    throw error;
  }
}

// First GET creates Not started; later GET is the gate before POST goals.
export async function getAiCoachDataApi(request, learnerToken) {
  try {
    const response = await request.get(urlData.aiCoachDataUrl, {
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not load this learner's AI Coach home data");
    throw error;
  }
}

// Empty POST, 204 — run after every assessment PUT.
export async function postAiCoachInsightsCompleteApi(request, learnerToken) {
  try {
    const response = await request.post(urlData.aiCoachInsightsCompleteUrl, {
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(204);
    return { success: true };
  } catch (error) {
    logger.error("Could not clear the Review new insights home task");
    throw error;
  }
}

// Match skills by name from this list; never store skill uuids in testData.
export async function getAiCoachRoleBasedSkillsApi(request, learnerToken) {
  try {
    const response = await request.get(urlData.aiCoachRoleBasedSkillsUrl, {
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not load skills for this learner's job role");
    throw error;
  }
}

// Call only after GET data shows both profile and assessment flags true.
export async function postAiCoachGoalApi(
  request,
  learnerToken,
  title,
  skillId,
  skillName,
) {
  try {
    const response = await request.post(urlData.aiCoachGoalsUrl, {
      data: aiCoachGoalPayload(title, skillId, skillName),
      headers: learnerHeaders(learnerToken),
    });
    expect([200, 201].includes(response.status())).toBe(true);
    const body = await response.json();
    const goalId = body?.session_goal?.goal_id || body?.goal_id;
    return { success: true, goalId, response: body };
  } catch (error) {
    logger.error(`Could not create a goal for ${skillName}`);
    throw error;
  }
}

// Creates the dashboard Tasks created rows for this goal.
export async function postAiCoachGoalTasksApi(request, learnerToken, goalId, tasks) {
  try {
    const response = await request.post(urlData.aiCoachGoalTasksUrl(goalId), {
      data: aiCoachGoalTasksPayload(tasks),
      headers: learnerHeaders(learnerToken),
    });
    expect([200, 201].includes(response.status())).toBe(true);
    const body = await response.json();
    const createdTasks = Array.isArray(body) ? body : body?.tasks || [];
    return { success: true, tasks: createdTasks, response: body };
  } catch (error) {
    logger.error("Could not create tasks on this goal");
    throw error;
  }
}

// Marks a goal task done; does not turn the goal green by itself.
export async function patchAiCoachTaskStatusApi(request, learnerToken, taskId) {
  try {
    const response = await request.patch(urlData.aiCoachTaskStatusUrl(taskId), {
      data: aiCoachTaskStatusPayload(),
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not mark a goal task complete");
    throw error;
  }
}

// Turns the goal green after every task on that goal is completed.
export async function patchAiCoachGoalStatusApi(request, learnerToken, goalId) {
  try {
    const response = await request.patch(urlData.aiCoachGoalStatusUrl(goalId), {
      data: aiCoachGoalStatusPayload(),
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not mark this goal achieved");
    throw error;
  }
}

// Full default users only — must be tied to a chat uuid or the learner UI will not show it.
export async function postAiCoachCoachingSessionApi(request, learnerToken, session) {
  try {
    if (!session?.launchId) {
      logger.info("No chat id for this weekly session — skipped");
      return null;
    }
    const response = await request.post(urlData.aiCoachCoachingSessionsUrl, {
      data: aiCoachCoachingSessionPayload(session),
      headers: coachingSessionHeaders(learnerToken, session.launchId),
    });
    expect([200, 201].includes(response.status())).toBe(true);
    return await response.json();
  } catch (error) {
    logger.error("Could not schedule a weekly coaching session");
    throw error;
  }
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

// Stream body is SSE; pull launch_id and assistant text without logging the raw stream.
function parseChatStream(rawText) {
  let launchId = null;
  const assistantParts = [];
  let currentEvent = "";
  for (let line of String(rawText || "").split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      currentEvent = line.slice(6).trim();
      continue;
    }
    if (!line.startsWith("data:")) {
      continue;
    }
    const data = line.slice(5).trim();
    if (!data) {
      continue;
    }
    try {
      const json = JSON.parse(data);
      launchId = json.launch_id || json.launchId || launchId;
      const piece = json.content || json.text || json.token || json.delta;
      if (typeof piece === "string") {
        assistantParts.push(piece);
      }
    } catch {
      if (currentEvent === "token") {
        assistantParts.push(data);
      }
      const found = data.match(UUID_RE);
      if (!launchId && found) {
        launchId = found[0];
      }
    }
  }
  if (!launchId) {
    const found = String(rawText || "").match(UUID_RE);
    if (found) {
      launchId = found[0];
    }
  }
  return { launchId, assistantText: assistantParts.join("") };
}

// First call uses launch_id null; later calls reuse the same id for this conversation.
export async function postAiCoachChatStreamApi(request, learnerToken, chat) {
  try {
    const response = await request.post(urlData.aiCoachChatStreamUrl, {
      data: aiCoachChatStreamPayload(chat),
      headers: headerData.aiCoachChatStreamHeaders(learnerToken),
      timeout: 180000,
    });
    expect(response.status()).toBe(200);
    const parsed = parseChatStream(await response.text());
    return { success: true, launchId: parsed.launchId, assistantText: parsed.assistantText };
  } catch (error) {
    logger.error("Could not send this learner's AI Coach chat");
    throw error;
  }
}

// Used to snapshot existing chats and to recover launch_id when SSE has no id.
export async function getAiCoachLaunchesApi(request, learnerToken) {
  try {
    const response = await request.get(`${urlData.aiCoachLaunchesUrl}?limit=30`, {
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not list this learner's chats");
    throw error;
  }
}

// Browser syncs notes after turns; missing notes is not a reason to skip closing the chat.
export async function getAiCoachSessionNotesApi(request, learnerToken, launchId) {
  try {
    const response = await request.get(urlData.aiCoachLaunchSessionNotesUrl(launchId), {
      headers: learnerHeaders(learnerToken),
    });
    if (response.status() !== 200) {
      return null;
    }
    return await response.json();
  } catch (error) {
    logger.error("Could not read notes for this chat");
    throw error;
  }
}

// Empty POST right before engagement-blocks when the learner closes the chat.
export async function postAiCoachLaunchCheckpointApi(request, learnerToken, launchId) {
  try {
    const response = await request.post(urlData.aiCoachLaunchCheckpointUrl(launchId), {
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("json")) {
      return await response.json();
    }
    return { success: true };
  } catch (error) {
    logger.error("Could not close this chat");
    throw error;
  }
}

// Records the closed block; duration is ended_at minus started_at.
export async function postAiCoachEngagementBlockApi(request, learnerToken, launchId, block) {
  try {
    const response = await request.post(urlData.aiCoachLaunchEngagementBlocksUrl(launchId), {
      data: aiCoachEngagementBlockPayload(block),
      headers: learnerHeaders(learnerToken),
    });
    expect(response.status()).toBe(200);
    return await response.json();
  } catch (error) {
    logger.error("Could not save the closed-chat time for the dashboard");
    throw error;
  }
}
