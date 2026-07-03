<script setup lang="ts">
const { teams, draftedPlayers, startBridge } = useDraftBridge();
const { data: fpRankings } = useFetch("/api/fantasypros");
const { data: dsRankings } = useFetch("/api/draftsharks");
const { data: dkRankings } = useFetch("/api/draftkings");
const { data: fgRankings } = useFetch("/api/footballguys");
const { data: fantasyCalcRankings } = useFantasyCalc();

let stopBridge: (() => void) | undefined;

let draftedIds = computed(() => {
  return new Set(draftedPlayers.value.map((player) => player.sleeper_id));
});

let availableFpPlayers = computed(() => {
  return fpRankings.value?.filter((player) => isAvailable(player));
});

let availableDsPlayers = computed(() => {
  return dsRankings.value?.filter((player) => isAvailable(player));
});

let availableDkPlayers = computed(() => {
  return dkRankings.value?.filter((player) => isAvailable(player));
});

let availableFgPlayers = computed(() => {
  return fgRankings.value?.filter((player) => isAvailable(player));
});

let availableFantasyCalcPlayers = computed(() => {
  return fantasyCalcRankings.value?.filter((p) => !draftedIds.value.has(p.player.sleeperId));
});

function isAvailable(player: any): boolean {
  console.assert(player.sleeper_id !== null, `Should always have a sleeper ID: ${player}`);
  return !draftedIds.value.has(player.sleeper_id);
}

onMounted(() => {
  stopBridge = startBridge();
});

onUnmounted(() => {
  stopBridge?.();
});

function positionColour(pos: string): string {
  switch (true) {
    case pos.startsWith("RB"):
      return "bg-green-300";
    case pos.startsWith("WR"):
      return "bg-blue-300";
    case pos.startsWith("TE"):
      return "bg-orange-300";
    case pos.startsWith("QB"):
      return "bg-red-300";
    case pos.startsWith("K"):
      return "bg-purple-300";
    case pos.startsWith("DEF"):
      return "bg-stone-300";
    default:
      return "bg-primary"
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div v-for="(team, teamIndex) in teams" class="">
      <div class="text-center font-semibold">
        <div class="text-2xl badge p-4 badge-ghost m-2">{{ team.team_name }}</div>
      </div>
      <div v-for="(player, playerIndex) in team.players">
        <div v-if="player.name === 'nan'" class="bg-neutral-500 rounded-box w-46 h-18 m-0.5"></div>
        <div v-else class="flex justify-between rounded-box text-primary-content w-46 h-18 p-1 m-0.5"
          :class="positionColour(player.position_details)">
          <div class="min-w-0 flex-1">
            <div class="card-title truncate">
              {{ player.name }}
            </div>

            <div class="text-sm text-primary-content/85 truncate">
              {{ player.position_details }}
            </div>

            <div v-if="playerIndex % 2 === 0">
              <Icon v-if="teamIndex === (teams.length - 1)" name="material-symbols:arrow-downward-rounded" size="16" />
              <Icon v-else name="material-symbols:arrow-forward-rounded" size="16" />
            </div>

            <div v-else>
              <Icon v-if="teamIndex === 0" name="material-symbols:arrow-downward-rounded" size="16" />
              <Icon v-else name="material-symbols:arrow-back-rounded" size="16" />
            </div>
          </div>

          <div class="shrink-0 text-center overflow-hidden">
            <div class="text-primary-content/60">
              {{ player.displayed_pick }}
            </div>

            <div class="overflow-hidden">
              <img v-if="player.img_url && player.img_url !== 'nan'" :src="player.img_url" width="55">
              <Icon v-else name="material-symbols:sports-football-rounded" size="36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <br />

  <div class="justify-center"></div>

  <div class="flex justify-around text-xl">
    <div>
      <div>Fantasy Pros ECR</div>
      <ul>
        <li v-for="(player, index) in availableFpPlayers" :key="player.player_id">
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }} -- {{ player.player_position_id }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Draft Sharks</div>
      <ul>
        <li v-for="(player, index) in availableDsPlayers" :key="player.ds_id">
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }} -- {{ player.position }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Draft Kings (Best Ball ADP)</div>
      <ul>
        <li v-for="(player, index) in availableDkPlayers" :key="player.site_player_id">
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }} -- {{ player.pos }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Football Guys</div>
      <ul>
        <li v-for="(player, index) in availableFgPlayers" :key="player.football_guys_id">
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Fantasy Calc</div>
      <ul>
        <li v-for="(p, index) in availableFantasyCalcPlayers" :key="p.player.sleeperId">
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ p.player.sleeperId }})
              {{ p.player.name }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.draft-board {
  display: flex;
}

.team-column {
  display: flex;
  flex-direction: column;
}

.square {
  background-color: aliceblue;
  padding: 0.2rem;
}


.draft-cell {
  min-width: 150px;
  max-height: 100px;
  margin: 2px;
  background-color: grey;
  display: flex;
  flex-direction: column;
}
</style>
