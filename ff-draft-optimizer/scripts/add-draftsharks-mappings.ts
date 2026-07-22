import { parse } from "node-html-parser";
import { normalize, addToCSV } from "./mappings-helper";

const html = await fetch(
  "https://www.draftsharks.com/rankings/load-rows?offset=0&limit=255&fantasyPosition=&pprSuperflexSlug=ppr&sort=-dsValue&researchDepth=rankings",
).then((response) => response.text());

const draftSharksIds = new Map<string, string>(
  parse(html)
    .querySelectorAll("tbody[data-player-row]")
    .filter((element) =>
      ["QB", "WR", "RB", "TE", "K", "DEF"].includes(
        element.getAttribute("data-fantasy-position") ?? "",
      ),
    )
    .map((player) => [
      `${normalize(player.getAttribute("data-player-name"))}`,
      player.getAttribute("data-key")!,
    ]),
);

addToCSV(draftSharksIds, "draft_sharks_id");
