import { parse } from "node-html-parser";
import playerIdMapJson from "#server/data/ds-sleeper-id-map.json";

type DraftSharksPlayerDTO = {
  ds_id: string;
  player_name: string;
  teamId: string;
  position: string;
  overallTier: number;
  positionalTier: number;
  isRookie: boolean;
  sleeper_id: string | null;
};

const playerIdMap = playerIdMapJson as Record<string, string>;

export default defineEventHandler(async () => {
  const htmlString = await $fetch<string>(
    "https://www.draftsharks.com/rankings/load-rows",
    {
      query: {
        offset: 0,
        limit: 255,
        position: "",
        pprSuperflexSlug: "ppr",
        sort: "-dsValue",
        researchDepth: "rankings",
      },
    },
  );

  const elements = parse(htmlString)
    .querySelectorAll("tbody[data-player-row]")
    .filter((element) =>
      ["QB", "WR", "RB", "TE", "K", "DEF"].includes(
        element.getAttribute("data-fantasy-position") ?? "",
      ),
    );

  const players: DraftSharksPlayerDTO[] = elements.map((element) => {
    const draft_sharks_id = element.getAttribute("data-key") ?? "";
    return {
      ds_id: draft_sharks_id,
      sleeper_id: playerIdMap[draft_sharks_id] ?? null,
      player_name: element.getAttribute("data-player-name") ?? "Unknown",
      teamId: element.getAttribute("data-team-id") ?? "",
      position: element.getAttribute("data-fantasy-position") ?? "",
      overallTier: Number(element.getAttribute("data-tier-overall")),
      positionalTier: Number(element.getAttribute("data-tier-positional")),
      isRookie: element.getAttribute("data-is-rookie") === "true",
    };
  });

  return players;
});
