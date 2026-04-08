<script setup lang="ts">
import { Shinkom } from 'shinkom'
import wasm from 'shinkom/wasm?url'
const shinkom = new Shinkom({
  engine: {
    wasmURL: wasm
  }
})

onMounted(() => {
  shinkom.init()
})

onUnmounted(() => {
  shinkom.destroy()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
