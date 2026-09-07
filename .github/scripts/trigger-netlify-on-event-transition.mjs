const projectId = process.env.SANITY_PROJECT_ID?.trim();
const dataset = process.env.SANITY_DATASET?.trim();
const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL?.trim();
const forceDeploy = process.env.FORCE_DEPLOY === "true";
const dryRun = process.env.DRY_RUN === "true";
const lookbackHours = Number(process.env.LOOKBACK_HOURS ?? "25");

if (!projectId || !/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error("SANITY_PROJECT_ID is missing or invalid.");
}

if (!dataset || !/^[a-z0-9_-]+$/.test(dataset)) {
  throw new Error(
    "SANITY_DATASET is missing or invalid. Set the GitHub repository variable to development or production.",
  );
}

if (!Number.isFinite(lookbackHours) || lookbackHours <= 24 || lookbackHours > 48) {
  throw new Error("LOOKBACK_HOURS must be greater than 24 and no more than 48.");
}

const query = `*[
  _type == "event"
  && defined(startDateTime)
  && (
    visibility == "public"
    || (visibility == "busyOnly" && status == "scheduled")
  )
]{
  _id,
  startDateTime,
  endDateTime
}`;

const queryUrl = new URL(
  `/v2026-09-07/data/query/${dataset}`,
  `https://${projectId}.api.sanity.io`,
);
queryUrl.searchParams.set("query", query);
queryUrl.searchParams.set("perspective", "published");

const response = await fetch(queryUrl, {
  headers: { Accept: "application/json" },
});

if (!response.ok) {
  throw new Error(
    `Sanity event check failed with HTTP ${response.status}. Confirm the project, dataset, and public-read configuration.`,
  );
}

const payload = await response.json();
if (!Array.isArray(payload.result)) {
  throw new Error("Sanity returned an unexpected response for the event check.");
}

const now = Date.now();
const cutoff = now - lookbackHours * 60 * 60 * 1000;
const transitionedEvents = payload.result.filter((event) => {
  const transitionAt = Date.parse(event.endDateTime ?? event.startDateTime);
  return Number.isFinite(transitionAt) && transitionAt > cutoff && transitionAt <= now;
});

if (!forceDeploy && transitionedEvents.length === 0) {
  console.log(
    `No ${dataset} event crossed the upcoming/past boundary in the last ${lookbackHours} hours. No Netlify credits used.`,
  );
  process.exit(0);
}

const reason = forceDeploy
  ? "a manual run requested a forced refresh"
  : `${transitionedEvents.length} event(s) crossed the upcoming/past boundary`;

if (dryRun) {
  console.log(`Dry run: would trigger Netlify because ${reason}.`);
  process.exit(0);
}

if (!buildHookUrl) {
  throw new Error(
    "NETLIFY_BUILD_HOOK_URL is missing. Add Hunter's Netlify build hook as a GitHub Actions repository secret.",
  );
}

const parsedBuildHookUrl = new URL(buildHookUrl);
if (
  parsedBuildHookUrl.protocol !== "https:" ||
  parsedBuildHookUrl.hostname !== "api.netlify.com" ||
  !parsedBuildHookUrl.pathname.startsWith("/build_hooks/")
) {
  throw new Error("NETLIFY_BUILD_HOOK_URL is not a valid Netlify build hook URL.");
}

const hookResponse = await fetch(parsedBuildHookUrl, { method: "POST" });
if (!hookResponse.ok) {
  throw new Error(`Netlify rejected the build-hook request with HTTP ${hookResponse.status}.`);
}

console.log(`Triggered Hunter's Netlify build because ${reason}.`);
