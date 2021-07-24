<template>
  <Dashboard />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Dashboard from '@/components/Dashboard.vue'

export default defineComponent({
  name: 'App',
  components: {
    Dashboard
  }
})
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}

#app {
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

</style>
