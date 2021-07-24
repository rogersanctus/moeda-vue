<template>
  <div class="view">
    <div style="display: flex">
      <span>Cambio dos últimos 30 dias:</span>
      <button style="margin-left: auto" @click="updateSeries">Update</button>
    </div>
    <!-- Chart -->
    <footer class="footer">RODAPÉ</footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Dashboard',

  setup() {
    return {
    }
  },
})
</script>
<style lang="scss" scoped>
.view {
  display: flex;
  flex-direction: column;
  height: 100%;

  footer {
    margin-top: auto;
  }
}
</style>
