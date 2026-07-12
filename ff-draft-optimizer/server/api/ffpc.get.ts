import { XMLParser } from "fast-xml-parser";
import playerIdMapJson from "#server/data/ffpc-sleeper-id-map.json";

type FFPCPlayerDTO = {
  name: string;
  nflTeam: string;
  position: string;
  adp: number;
  min: number | null;
  max: number | null;
  leaguesDraftedIn: number;
  bgsPlayerID: string;
  sportsDataForeignKey: string;
  sleeper_id: string | null;
};

const playerIdMap = playerIdMapJson as Record<string, string>;

const MAX_ENTRIES = 250;

export default defineEventHandler(async () => {
  const rawXML = await $fetch<string>("https://myffpc.com/FFPCADPReport.ashx", {
    params: {
      draftStartDateFrom: "01Jul2026",
      draftStartDateTo: "11Dec2026",
      leagueTypeID: 1,
      superflexFilter: 0,
      slimRostersFilter: 0,
    },
  });

  const numericAttrs = new Set(["adp", "min", "max", "leaguesDraftedIn"]);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (_, path) => path === "data.players.player",
    attributeValueProcessor: (name, value) =>
      numericAttrs.has(name) ? Number(value) : value,
  });

  return parser
    .parse(rawXML)
    .data.players.player.slice(0, MAX_ENTRIES)
    .map((player: FFPCPlayerDTO) => ({
      ...player,
      sleeper_id: playerIdMap[player.sportsDataForeignKey] ?? null,
    })) as FFPCPlayerDTO[];
});
