import { parse } from "node-html-parser";
import playerIdMapJson from "#server/data/fg-sleeper-id-map.json";

type FootballGuysPlayerDTO = {
  player_name: string;
  position: string;
  team: string;
  football_guys_id: string;
  sleeper_id: string | null;
};

const playerIdMap = playerIdMapJson as Record<string, string>;
const MAX_ENTRIES = 300;

export default defineEventHandler(async () => {
  const htmlString = await $fetch<string>(
    "https://www.footballguys.com/rankings#more",
  );

  const root = parse(htmlString);

  const players: FootballGuysPlayerDTO[] = root
    .querySelectorAll("tr[data-playerid][data-rank][data-playername]")
    .slice(0, MAX_ENTRIES)
    .map((tr) => {
      const spans = tr.querySelectorAll('[class^="pos-"], [class^="team-abbr"]');
      const footballGuysId = tr?.getAttribute("data-playerid") ?? "";

      return {
        player_name: tr.getAttribute("data-playername") ?? "",
        team: spans[0]?.innerText ?? "",
        position: spans[1]?.innerText.replace(/[0-9]/g, "") ?? "",
        football_guys_id: footballGuysId,
        sleeper_id: playerIdMap[footballGuysId] ?? null,
      };
    });

  return players;
});
