const STORAGE_KEY = "sleeperDraftPicks";

function sendPicksToWebsite(picks) {
  window.postMessage(
    {
      source: "sleeper-draft-extension",
      type: "DRAFT_PICKS_UPDATED",
      picks,
    },
    window.location.origin,
  );
}

async function sendCurrentPicks() {
  const { sleeperDraftPicks = [] } =
    await chrome.storage.local.get(STORAGE_KEY);

  sendPicksToWebsite(sleeperDraftPicks);
}

// Send updates whenever Sleeper tab has a storage update
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY]) {
    return;
  }

  sendPicksToWebsite(changes[STORAGE_KEY].newValue ?? []);
});

// Allow webpage to request the current value
window.addEventListener("message", (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }

  if (event.data?.source === "draft-website" && event.data?.type === "REQUEST_DRAFT_PICKS") {
    void sendCurrentPicks();
  }
});

void sendCurrentPicks();
