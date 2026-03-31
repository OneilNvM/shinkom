<script setup lang="ts">
import { Shinkom } from 'shinkom'
const shinkom = new Shinkom()

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
