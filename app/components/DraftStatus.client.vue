<script setup lang="ts">
const { draftedPlayers, startBridge } = useDraftBridge();

let stopBridge: (() => void) | undefined;

onMounted(() => {
    stopBridge = startBridge;
})

onUnmounted(() => {
    stopBridge?.()
})
</script>

<template>
    <p>{{ draftedPlayers.length }} player(s) drafted</p>
</template>