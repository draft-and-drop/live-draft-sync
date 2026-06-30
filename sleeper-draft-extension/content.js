const PICKS_KEY = "sleeperDraftPicks";
const TEAMS_KEY = "sleeperTeamPicks";

let prevRes = "";

function parsePlayerCell(cell) {
  console.assert(cell instanceof HTMLElement);

  const overallPickMatch = cell.id.match(/^draft-cell-(\d+)$/);
  console.assert(overallPickMatch);
  const avatar = cell.querySelector(".avatar-player");

  const sleeper_id = avatar
    ?.getAttribute("aria-label")
    ?.match(/^nfl Player\s+(.+)$/i)[1]
    ?.trim();
  console.assert(sleeper_id);

  return {
    sleeper_id,
    overall_pick: Number(overallPickMatch[1]),
    displayed_pick: cell.querySelector(".pick")?.textContent?.trim(),
    name: cell.querySelector(".player-name")?.textContent?.trim(),
    img_url: avatar.getAttribute("src"),
    position_details: cell.querySelector(".position")?.textContent?.trim(),
  };
}

function parseTeamColumn(teamCell) {
  console.assert(teamCell instanceof HTMLElement);

  const teamNameElement = teamCell.querySelector(
    ".team-header-container .header-text",
  );
  console.assert(teamNameElement instanceof HTMLElement);

  // collect the drafted players
  const playerObjs = [];
  const playerCells = teamCell.querySelectorAll(
    '[id^="draft-cell-"].cell.drafted',
  );

  for (const playerCell of playerCells) {
    playerObjs.push(parsePlayerCell(playerCell));
  }

  return {
    team_name: teamNameElement.textContent,
    players: playerObjs,
  };
}

async function scanDraftBoard() {
  const teamObjects = [];
  const teams = document.querySelectorAll(".team-column");

  for (const team of teams) {
    const teamObj = parseTeamColumn(team);
    console.assert(teamObj.team_name && teamObj.players);
    teamObjects.push(teamObj);
  }

  const serialized = JSON.stringify(teamObjects);
  if (serialized !== prevRes) {
    previousResult = serialized;
    const draftedPlayers = teamObjects
      .flatMap((teamObj) => teamObj.players)
      .sort((a, b) => a.overall_pick - b.overall_pick);
    await chrome.storage.local.set({
      [PICKS_KEY]: draftedPlayers,
      [TEAMS_KEY]: teamObjects,
    });
    console.log("[Sleeper Draft Monitor] Teams updated:", teamObjects);
  }
}

function observeDraftBoard(draftBoard) {
  const draftBoardObserver = new MutationObserver(scanDraftBoard);

  draftBoardObserver.observe(draftBoard, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "id", "src", "aria-label"],
  });
}

const waitForBoard = new MutationObserver(() => {
  const draftBoard = document.querySelector(".draft-board");
  if (!draftBoard) {
    return;
  }

  console.log("[Sleeper Draft Monitor] Draft Board found.");
  waitForBoard.disconnect();
  scanDraftBoard();
  observeDraftBoard(draftBoard);
});

waitForBoard.observe(document.documentElement, {
  subtree: true,
  childList: true,
});
