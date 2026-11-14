<script setup lang="ts">
import { Shinkom } from 'shinkom'
import wasm from 'shinkom/wasm?url'

let shinkom: Shinkom;

onMounted(() => {
  shinkom = new Shinkom({
    engine: {
      wasmURL: wasm
    }
  })
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
    <NuxtLink href="/test">Test</NuxtLink>
  </div>
</template>
