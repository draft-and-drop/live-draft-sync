type FootballGuysPlayerDto = {
  player_name: string;
  team: string;
  football_guys_id: string;
  sleeper_id: string | null;
};

import { parse } from "node-html-parser";
import playerIdMapJson from "../data/fg-sleeper-id-map.json";

const playerIdMap = playerIdMapJson as Record<string, string>;

export default defineEventHandler(async () => {
  const htmlString = await $fetch<string>(
    "https://www.footballguys.com/adp?season=2026&pos=all",
  );

  const root = parse(htmlString);

  const players: FootballGuysPlayerDto[] = root
    .querySelectorAll("tr")
    .slice(1)
    .map((tr) => {
      const tds = tr.querySelectorAll("td");
      const a = tds[1]?.querySelector("a");
      const href = a?.getAttribute("href") ?? "";

      const footballGuysId = href.split("/").at(-1)?.replace("+", ".") ?? "";

      return {
        player_name: a?.text.trim() ?? "",
        team: tds[3]?.text.trim().split("/")[0]?.trim() ?? "",
        football_guys_id: footballGuysId,
        sleeper_id: playerIdMap[footballGuysId] ?? null
      };
    });

  return players;
});
