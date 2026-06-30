<script setup lang="ts">
const { teams, /* draftedPlayers*/ startBridge } = useDraftBridge();
const { data: fpRankings } = useFetch("/api/fantasypros");
const { data: dsRankings } = useFetch("/api/draftsharks");
const { data: dkRankings } = useFetch("/api/draftkings");
const { data: fgRankings } = useFetch("/api/footballguys");
const { data: fantasyCalcRankings } = useFantasyCalc();

let stopBridge: (() => void) | undefined;

let draftedIds = computed(() => {
  return new Set();
  // return new Set(draftedPlayers.value.map((player) => player.playerId));
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
</script>

<template>

  <div class="draft-board">
    <div v-for="team in teams" class="team-column">
      <div class="team-header">{{ team.team_name }}</div>
      <div v-for="player in team.players" class="draft-cell">
        <div>
          {{ player.name }}
        </div>
        <div>
          {{ player.displayed_pick }}
        </div>
        <div>
          {{ player.position_details }}
        </div>
        <div>
          <img :src="player.img_url" width="30" height="30">
        </div>
      </div>
    </div>
  </div>

  <br />

  <div style="display: flex">
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
        <li v-for="(p, index) in fantasyCalcRankings" :key="p.player.sleeperId">
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

.img {
  width: 30px;
  height: 30px;
}

.team-header {
  text-align: center;
  font-size: large;
  color: grey;
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
