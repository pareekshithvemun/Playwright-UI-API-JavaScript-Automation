import {
  createLinkedContent,
  fs,
  fetchAllLinkedContentSummaries,
  logger,
  path,
  publishLinkContent,
  reusableFunctions,
  config,
} from "../../../path.js";

/** Same metadata as tests/API/Admin/createArea.spec.js beforeAll */
const SKILL_SOFT_COACHING = {
  title: "Skillsoft Coaching",
  url: "https://www.figma.com/proto/JlLdLcTT65KRT9k2EJfTid/Client-Web---Skillsoft-Coaching?node-id=63993-75043&amp%3Bnode-type=canvas&amp%3Bt=Z7PboSadv31mIDmQ-0&amp%3Bscaling=min-zoom&amp%3Bcontent-scaling=fixed&amp%3Bpage-id=45525%3A24478&amp%3Bstarting-point-node-id=63993%3A73909&amp%3Bshow-proto-sidebar=1",
  description:
    "Our Coaching solution consists of enhanced targeted top-tier content, human and AI coaches, and technology that helps to transform people and organizations to drive lasting measurable outcomes.",
  imageUrl:
    "https://cdn.bfldr.com/YWP0W9AT/at/x4nnm8gcrh36g9k57h8js24/Coaching.png",
  modality: "READ",
  duration: 600,
};

function cacheFilePath() {
  return path.join(
    process.cwd(),
    "test-results",
    "create-area-skillsoft-coaching-cache.json",
  );
}

function lockFilePath() {
  return path.join(
    process.cwd(),
    "test-results",
    ".create-area-skillsoft-coaching.lock",
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Find reusable linked content by title, or create + publish once.
 * Prefers summaries API over creating duplicates.
 */
async function getOrCreatePublishedSkillsoftCoachingLinked(request, jwt) {
  const {
    title,
    url,
    description,
    imageUrl,
    modality,
    duration,
  } = SKILL_SOFT_COACHING;

  const items = (await fetchAllLinkedContentSummaries(request, jwt)) || [];
  const sameTitle = items.filter((item) =>
    reusableFunctions.linkedContentTitlesMatch(item.title, title),
  );

  const ready = sameTitle.find(
    reusableFunctions.linkedContentIsPublishedAndVisible,
  );
  if (ready?.linkedContentUuid) {
    logger.info(
      `Skillsoft Coaching: reusing existing published linked content uuid=${ready.linkedContentUuid}`,
    );
    return ready.linkedContentUuid;
  }

  const draftNotRetired = sameTitle.find(
    (item) =>
      item.linkedContentUuid &&
      !reusableFunctions.linkedContentIsRetired(item) &&
      !reusableFunctions.linkedContentIsPublishedAndVisible(item),
  );
  if (draftNotRetired?.linkedContentUuid) {
    logger.info(
      `Skillsoft Coaching: publishing existing draft uuid=${draftNotRetired.linkedContentUuid}`,
    );
    await publishLinkContent(request, jwt, draftNotRetired.linkedContentUuid);
    return draftNotRetired.linkedContentUuid;
  }

  logger.info("Skillsoft Coaching: creating new linked content");
  const uuid = await createLinkedContent(
    request,
    jwt,
    title,
    url,
    description,
    imageUrl,
    modality,
    duration,
  );
  if (!uuid) {
    throw new Error(
      "createLinkedContent did not return a uuid for Skillsoft Coaching",
    );
  }
  await publishLinkContent(request, jwt, uuid);
  return uuid;
}

function readValidCache(baseURL) {
  try {
    const p = cacheFilePath();
    if (!fs.existsSync(p)) return null;
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    if (data.baseURL === baseURL && data.uuid) {
      return data.uuid;
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

function writeCache(baseURL, uuid) {
  fs.mkdirSync(path.dirname(cacheFilePath()), { recursive: true });
  fs.writeFileSync(
    cacheFilePath(),
    JSON.stringify({ baseURL, uuid, ts: Date.now() }),
    "utf8",
  );
}

/**
 * Resolves "Skillsoft Coaching" linked content UUID for createArea.spec.js.
 * - Uses disk cache (per baseURL) when present so reruns skip API churn.
 * - Uses an exclusive lock so parallel workers run get-or-create only once; others wait and read cache.
 */
export async function resolveSkillsoftCoachingLinkedContent(request, jwt) {
  const baseURL = config.get("Environment.baseURL");

  const cached = readValidCache(baseURL);
  if (cached) {
    logger.info(
      `Skillsoft Coaching: using cached uuid from test-results (${cached})`,
    );
    return cached;
  }

  const maxMs = 180000;
  const deadline = Date.now() + maxMs;

  while (Date.now() < deadline) {
    try {
      fs.mkdirSync(path.dirname(lockFilePath()), { recursive: true });
      fs.openSync(lockFilePath(), "wx");
      try {
        const uuid = await getOrCreatePublishedSkillsoftCoachingLinked(
          request,
          jwt,
        );
        writeCache(baseURL, uuid);
        logger.info(
          `Skillsoft Coaching: wrote cache for workers (${uuid})`,
        );
        return uuid;
      } finally {
        try {
          fs.unlinkSync(lockFilePath());
        } catch (_) {
          /* ignore */
        }
      }
    } catch (err) {
      if (err && err.code === "EEXIST") {
        const afterWait = readValidCache(baseURL);
        if (afterWait) {
          logger.info(
            `Skillsoft Coaching: another worker filled cache (${afterWait})`,
          );
          return afterWait;
        }
        await sleep(300);
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    "resolveSkillsoftCoachingLinkedContent: timed out waiting for lock/cache",
  );
}
