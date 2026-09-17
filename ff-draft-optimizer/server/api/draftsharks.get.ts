import { parse } from "node-html-parser";
import playerIdMapJson from "#server/data/ds-sleeper-id-map.json";

type DraftSharksPlayerDTO = {
  overall_pick: number;
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

const teamMapping: Record<string, string> = {
  "1": "ATL",
  "2": "WAS",
  "3": "BAL",
  "4": "BUF",
  "5": "CAR",
  "6": "CHI",
  "8": "KC",
  "9": "DAL",
  "10": "DEN",
  "11": "DET",
  "12": "GB",
  "13": "HOU",
  "14": "IND",
  "15": "JAX",
  "16": "KC",
  "17": "LV",
  "18": "MIN",
  "19": "NE",
  "20": "NO",
  "21": "NYG",
  "22": "SEA",
  "23": "SF",
  "24": "PHI",
  "25": "PIT",
  "26": "LAC",
  "27": "SEA",
  "28": "SF",
  "29": "LAR",
  "30": "TB",
  "31": "TEN",
  "32": "HOU",
  "33": "WAS",
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const htmlString = await $fetch<string>(
    "https://www.draftsharks.com/rankings/load-rows",
    {
      query: {
        offset: 0,
        limit: 255,
        pprSuperflexSlug: query.format,
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

  let overallPick = 1;
  const players: DraftSharksPlayerDTO[] = elements.map((element) => {
    const draft_sharks_id = element.getAttribute("data-key") ?? "";
    return {
      overall_pick: overallPick++,
      ds_id: draft_sharks_id,
      sleeper_id: playerIdMap[draft_sharks_id] ?? null,
      player_name: element.getAttribute("data-player-name") ?? "Unknown",
      teamId: teamMapping[element.getAttribute("data-team-id") ?? ""] ?? "",
      position: element.getAttribute("data-fantasy-position") ?? "",
      overallTier: Number(element.getAttribute("data-tier-overall")),
      positionalTier: Number(element.getAttribute("data-tier-positional")),
      isRookie: element.getAttribute("data-is-rookie") === "true",
    };
  });

  return players;
});
