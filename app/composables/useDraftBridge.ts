// export interface DraftedPlayer {
//   playerId: string;
//   name: string;
//   overallPick: number;
//   positionDetails: string;
// }

export interface Team {
  team_name: string;
  players: DraftedPlayer[]
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
  // const teams = useState<
  const teams = useState<Team[]>("drafted-players", () => []);

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

      

      // console.log("DATA", event.data.teams)

      teams.value = event.data.teams;
      

      // teams.value = event.data.picks ?? [];
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
    // draftedPlayers,
    teams,
    startBridge
  }
}

// export function useDraftBridge() {
//   const teams = useState<
//   const draftedPlayers = useState<DraftedPlayer[]>("drafted-players", () => []);

//   function startBridge() {
//     function handleMessage(event: MessageEvent) {
//       if (event.source !== window) return;
//       if (event.origin !== window.location.origin) return;

//       if (
//         event.data?.source !== "sleeper-draft-extension" ||
//         event.data?.type !== "DRAFT_PICKS_UPDATED"
//       ) {
//         return;
//       }

//       draftedPlayers.value = event.data.picks ?? [];
//     }

//     window.addEventListener("message", handleMessage);

//     window.postMessage(
//       {
//         source: "draft-website",
//         type: "REQUEST_DRAFT_PICKS",
//       },
//       window.location.origin,
//     );

//     return () => window.removeEventListener("message", handleMessage);
//   }

//   return {
//     draftedPlayers,
//     startBridge
//   }
// }
