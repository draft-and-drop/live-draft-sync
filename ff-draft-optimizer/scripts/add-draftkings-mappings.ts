import {normalize, addToCSV} from "./mappings-helper";

const draftSharksRes = await fetch(
  "https://www.occupyfantasyapi.com/best_ball/adps?site=draftkings&contest=all",
);

if (!draftSharksRes.ok) {
    throw new Error(`HTTP Error: ${draftSharksRes.status}`);
}

const data = await draftSharksRes.json();

const draftKingsIds = new Map<string, string>(
  data.adps.map((player: any) => [
    `${normalize(player.player_name)}`,
    player.site_player_id,
  ]),
);

addToCSV(draftKingsIds, "draft_kings_id");
