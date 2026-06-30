const STORAGE_KEY = "sleeperDraftPicks";

let scanScheduled = false;
let previousResult = "";

function parseDraftCell(cell) {
  if (!(cell instanceof HTMLElement)) {
    return null;
  }

  const overallPickMatch = cell.id.match(/^draft-cell-(\d+)$/);

  if (!overallPickMatch) {
    return null;
  }

  const avatar = cell.querySelector(".avatar-player");
  const ariaLabel = avatar?.getAttribute("aria-label") ?? "";

  // e.g., aria-label="nfl Player 9221"
  const playerIdMatch = ariaLabel.match(/^nfl Player\s+(.+)$/i);
  const playerId = playerIdMatch?.[1]?.trim();

  if (!playerId) {
    return null;
  }

  return {
    overallPick: Number(overallPickMatch[1]),
    displayedPick:
      cell.querySelector(".pick")?.textContent?.trim() ?? null,
    playerId,
    name:
      cell.querySelector(".player-name")?.textContent?.trim() ?? null,
    positionDetails:
      cell.querySelector(".position")?.textContent?.trim() ?? null
  };
}

async function scanDraftBoard() {
  scanScheduled = false;

  const picksByNumber = new Map();

  const cells = document.querySelectorAll(
    '[id^="draft-cell-"].cell.drafted'
  );

  for (const cell of cells) {
    const pick = parseDraftCell(cell);

    if (pick) {
      // Prevent duplicate cells for the same overall pick.
      picksByNumber.set(pick.overallPick, pick);
    }
  }

  const picks = [...picksByNumber.values()].sort(
    (a, b) => a.overallPick - b.overallPick
  );

  const serialized = JSON.stringify(picks);

  // Do not write to storage when nothing changed.
  if (serialized === previousResult) {
    return;
  }

  previousResult = serialized;

  await chrome.storage.local.set({
    [STORAGE_KEY]: picks
  });

  console.log("[Sleeper Draft Monitor] Picks updated:", picks);
}

function scheduleScan() {
  if (scanScheduled) {
    return;
  }

  scanScheduled = true;

  // Combine multiple React DOM mutations into one scan.
  requestAnimationFrame(scanDraftBoard);
}

const observer = new MutationObserver(scheduleScan);

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["class", "id", "aria-label", "src"]
});

// Capture picks that were already present when the extension loaded.
scanDraftBoard();