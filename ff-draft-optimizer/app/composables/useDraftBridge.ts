export interface Team {
  team_name: string;
  players: DraftedPlayer[];
}
export interface DraftedPlayer {
  sleeper_id: string;
  displayed_pick: string;
  img_url: string;
  name: string;
  overall_pick: number;
  position_details: string;
}

export function useDraftBridge() {
  const draftedPlayers = useState<DraftedPlayer[]>("drafted-players", () => []);
  const teams = useState<Team[]>("teams", () => []);

  function startBridge() {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;

      if (
        event.data?.source !== "sleeper-draft-extension" ||
        event.data?.type !== "DRAFT_PICKS_UPDATED"
      ) {
        return;
      }

      draftedPlayers.value = event.data.picks;
      teams.value = event.data.teams;
    }

    window.addEventListener("message", handleMessage);

    window.postMessage(
      {
        source: "draft-website",
        type: "REQUEST_DRAFT_PICKS",
      },
      window.location.origin,
    );

    return () => window.removeEventListener("message", handleMessage);
  }

  return {
    draftedPlayers,
    teams,
    startBridge,
  };
}
