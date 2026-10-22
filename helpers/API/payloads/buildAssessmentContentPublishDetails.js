const DEFAULT_SKILL_BENCHMARK_IMAGE =
  "https://cdn2.percipio.com/public/c/public/images/skill-benchmark-image.png";

export function buildAssessmentContentPublishDetails(
  getAssessmentResponse,
  getAssessmentQuestionsResponse,
  options,
  uuidMappingResponse,
) {
  const assessment = getAssessmentResponse?.data?.getAssessment;
  const questionsData = getAssessmentQuestionsResponse?.data;
  const learningObjectivesWithQuestions =
    getAssessmentQuestionsResponse?.learningObjectives ??
    questionsData?.learningObjectives ??
    [];
  const { invokerUuid, contentContainerId } = options;
  const mappingLOs = uuidMappingResponse?.learningObjectives ?? uuidMappingResponse ?? [];

  const orgId = assessment?.orgId ?? assessment?.organizationUuid;
  const durationInSeconds =
    assessment?.duration != null ? assessment.duration * 60 : 8 * 60;
  const imageUrl =
    assessment?.image ?? questionsData?.imageUrl ?? DEFAULT_SKILL_BENCHMARK_IMAGE;

  const learningObjectiveQuestions = learningObjectivesWithQuestions.map(
    (learningObjectiveItem, loIndex) => {
      const loMapping = mappingLOs[loIndex];
      const questionBankUuid =
        loMapping?.externalId ??
        learningObjectiveItem.learningObjectiveUuid ??
        learningObjectiveItem.id;
      const questionsMapping = loMapping?.questions;
      return {
        learningObjective:
          learningObjectiveItem.learningObjective ??
          learningObjectiveItem.description,
        questionBankUuid,
        questions: mapQuestionsToPublishFormat(
          learningObjectiveItem.questions || [],
          invokerUuid,
          questionsMapping,
        ),
        position: loIndex + 1,
      };
    },
  );

  const recommendations = (assessment?.recommendations ?? []).map(
    (recommendationItem) => {
      const contentType = (recommendationItem.contentType ?? "COURSE").toUpperCase();
      const isChannel = contentType === "CHANNEL";
      const title =
        recommendationItem.title ??
        recommendationItem.name ??
        recommendationItem.contentTitle ??
        "";
      return {
        recommendedContentItemUuid: recommendationItem.contentId,
        recommendationUuid:
          recommendationItem.recommendationUuid ?? recommendationItem.contentId,
        title,
        recommendationTypeKey: isChannel ? "CHANNEL" : "CONTENT",
        recommendedContentItemTypeKey: isChannel ? "CHANNEL" : "COURSE",
        locale: (assessment?.locale ?? "en-US").startsWith("en")
          ? "en"
          : assessment?.locale ?? "en-US",
      };
    },
  );

  const content = {
    invokerUuid: invokerUuid,
    linkedContentUuid: contentContainerId,
    ownerUuid: orgId, // org id (from getAssessment.orgId)
    locale: null, // match UI (working request sends null)
    authoringSystemRef: "LX_STUDIO_ASSESSMENTS",
    assetId: contentContainerId,
    title: assessment.title,
    description: assessment.description,
    durationInSeconds,
    ownerType: "ORGANIZATION",
    organizationUuid: orgId,
    contentSource: assessment?.contentSource ?? "Custom",
    contentType: "SKILL_BENCHMARK",
    expertiseLevel: assessment?.expertiseLevel ?? "Intermediate",
    imageUrl,
    skills: assessment?.skills ?? [],
    assessmentSpecificDetails: {
      imageFile: {
        url: imageUrl,
        altText: assessment?.altText ?? "",
      },
      learningObjectiveQuestions,
      questionCountPerLearningObjective: assessment.configuration,
      recommendations,
      // Send empty to match UI: avoids "create from assessment" path that returns 409 when content already exists
      sourceAssessmentUuid: "",
    },
    category: "Skill Benchmark",
  };

  const totalQuestions = learningObjectiveQuestions.reduce(
    (sum, lo) => sum + (lo.questions?.length ?? 0),
    0,
  );
  if (
    typeof process !== "undefined" &&
    process.env?.DEBUG_PUBLISH_BODY === "1"
  ) {
    // eslint-disable-next-line no-console
    console.debug(
      "[buildAssessmentContentPublishDetails]",
      contentContainerId,
      "learningObjectivesCount:",
      learningObjectiveQuestions.length,
      "totalQuestions:",
      totalQuestions,
      "content keys:",
      Object.keys(content),
    );
  }
  return { content };
}

/** Use questionType from get-assessment-questions response; normalize casing/spaces; fallback MULTIPLE_CHOICE. */
/** Publish API expects MULTIPLE_CHOICE for multi-select and scenario-based (match network tab / UI). */
function normalizeQuestionType(value) {
  if (value == null || value === "") return "MULTIPLE_CHOICE";
  const s = String(value).trim();
  const normalized = s ? s.toUpperCase().replace(/\s+/g, "_") : "MULTIPLE_CHOICE";
  if (normalized === "MULTIPLE_CHOICE_MULTI_SELECT" || normalized === "SCENARIO_BASED")
    return "MULTIPLE_CHOICE";
  return normalized;
}

function mapQuestionsToPublishFormat(questions, ownerUuid, questionsMapping) {
  if (!Array.isArray(questions)) return [];
  return questions.map((questionItem, qIndex) => {
    const rawType =
      questionItem.questionType ??
      questionItem.type ??
      questionItem.question_type;
    const questionType = normalizeQuestionType(rawType);
    const isMatching = questionType === "MATCHING";
    const qMapping = questionsMapping?.[qIndex];
    const questionUuid = qMapping?.externalId ?? questionItem.id;
    const answerMapping = qMapping?.answer_mapping;
    const answers = isMatching
      ? mapMatchingAnswers(questionItem, questionUuid, answerMapping)
      : mapStandardAnswers(questionItem.answer || []);
    const targets = isMatching
      ? mapMatchingTargets(questionItem, questionUuid, answerMapping)
      : [];
    const base = {
      questionUuid,
      stem: questionItem.questionText ?? questionItem.stem,
      label: questionItem.questionText ?? questionItem.stem,
      questionType,
      mode: "TEST",
      shuffle: null,
      durationInSeconds: 60,
      answers,
      targets,
      difficultyLevel: mapDifficulty(questionItem.aiGeneratedDifficulty),
    };
    if (!isMatching) {
      base.images = [];
      base.backgroundText = null;
      if (ownerUuid) base.ownerUuid = ownerUuid;
    }
    return base;
  });
}

function mapStandardAnswers(answerList) {
  if (!Array.isArray(answerList)) return [];
  return answerList.map((answerOption) => ({
    practiceFeedback: answerOption.explanation ?? "",
    correct: !!answerOption.isCorrect,
    rank: 0,
    text: answerOption.answerText ?? answerOption.text ?? "",
  }));
}

function mapMatchingAnswers(questionItem, questionUuid, answerMapping) {
  const first = questionItem.answer && questionItem.answer[0];
  if (!first || !first.answers) return [];
  const answerIdMap = buildIdMap(answerMapping?.answers);
  return (first.answers || []).map((answerOption) => {
    const text = answerOption.text ?? answerOption.label ?? "";
    const uuid = answerIdMap?.get(answerOption.uuid) ?? answerOption.uuid;
    return {
      questionUuid,
      uuid,
      text,
      label: text,
    };
  });
}

function mapMatchingTargets(questionItem, questionUuid, answerMapping) {
  const first = questionItem.answer && questionItem.answer[0];
  if (!first || !first.targets) return [];
  const targetsList = answerMapping?.targets;
  return (first.targets || []).map((targetOption, tIndex) => {
    const tMapping = targetsList?.[tIndex];
    return {
      questionUuid,
      uuid: tMapping?.externalId ?? targetOption.uuid,
      matches: tMapping?.matches ?? targetOption.matches ?? [],
      text: targetOption.text,
      practiceFeedback:
        (first.explanation || []).find(
          (e) => e.column_b_answers === targetOption.text,
        )?.explanation ?? "",
    };
  });
}

function buildIdMap(entries) {
  if (!Array.isArray(entries)) return null;
  const map = new Map();
  for (const e of entries) {
    if (e?.localId != null && e?.externalId != null)
      map.set(e.localId, e.externalId);
  }
  return map.size ? map : null;
}

function mapDifficulty(level) {
  if (level == null || level === "") return "MODERATE";
  const u = String(level).toUpperCase();
  if (u === "DIFFICULT" || u === "HARD") return "DIFFICULT";
  if (u === "EASY" || u === "BEGINNER") return "EASY";
  return "MODERATE";
}
