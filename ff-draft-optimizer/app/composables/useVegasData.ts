export interface VegasPlayer {
  Player: string;
  Position: string;
  PlayerID: string;
  Team: string;
  PassYds: number;
  PassTDs: number;
  PassINTs: number;
  RushYds: number;
  RushTDs: number;
  FantasyPoints: number;
}

export interface TeamsDTO {
  updated: string;
  season: number;
  source: string;
  playoff_weeks: number[];
  teams: NFLTeam[];
}

export interface NFLTeam {
  abbr: string;
  name: string;
  color: string;
  ppg: string;
}

export function useVegasData() {
  return useAsyncData("vegas-multi-api", async () => {
    const [qbs, rbs, wrs, tes, teamsObject] = await Promise.all([
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/qb/rankings?bookmaker=Average",
      ),
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/rb/rankings?bookmaker=Average",
      ),
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/wr/rankings?bookmaker=Average",
      ),
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/te/rankings?bookmaker=Average",
      ),
      $fetch<string>(
        "https://raw.githubusercontent.com/RMSummerlin/impliedseasontotals/main/implied-totals.json",
      ),
    ]);

    const parsedTeams: TeamsDTO =
      typeof teamsObject === "string" ? JSON.parse(teamsObject) : teamsObject;

    return {
      vegasPlayers: [...qbs, ...rbs, ...wrs, ...tes],
      nflTeams: parsedTeams.teams,
    };
  });
}
