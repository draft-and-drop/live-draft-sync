import playerIdMapJson from "../data/dk-sleeper-id-map.json";

type DraftKingsResponse = {
  adps: DraftKingsPlayerDTO[];
};

type DraftKingsPlayerDTO = {
  site_player_id: string;
  player_name: string;
  pos: string;
  team: string;
  bye_week: number;
  curr_adp: number;
  last_week_adp: number;
  opener_adp: number;
  adp_change_since_last_week: number;
  adp_change_since_open: number;
};

const playerIdMap = playerIdMapJson as Record<string, string>;
const MAX_ENTRIES = 300;

export default defineEventHandler(async () => {
  const res = await $fetch<DraftKingsResponse>(
    "https://www.occupyfantasyapi.com/best_ball/adps?site=draftkings&contest=all",
  );

  return res.adps.slice(0, MAX_ENTRIES).map((player) => ({
    ...player,
    sleeper_id: playerIdMap[player.site_player_id] ?? null,
  }));
});
