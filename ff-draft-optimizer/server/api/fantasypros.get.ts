interface FantasyProsRankingsResponse {
  players: FantasyProsPlayerDTO[];
}

interface FantasyProsPlayerDTO {
  player_id: number;
  player_name: string;
  rank_ecr: number;
  rank_ave: string;
  player_position_id: string;
  team_id: string;
  tier: number;
  sleeper_id: string | null
}

import playerIdMapJson from "../data/fp-sleeper-id-map.json";

const playerIdMap = playerIdMapJson as Record<string, string>

const SEASON = 2026;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (!config.fantasyProsApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "FantasyPros API key is not configured",
    });
  }

  try {
    const response = await $fetch<FantasyProsRankingsResponse>(
      `https://api.fantasypros.com/public/v2/json/nfl/${SEASON}/consensus-rankings`,
      {
        headers: {
          "x-api-key": config.fantasyProsApiKey,
        },
        query: {
          position: "ALL",
          scoring: "PPR",
          type: "ADP",
        },
      },
    );

    return response.players.map(player => ({
      ...player,
      sleeper_id: playerIdMap[String(player.player_id)] ?? null
    }));
  } catch (error) {
    console.error("FantasyPros request failed:", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Could not retrieve FantasyPros rankings",
    });
  }
});
