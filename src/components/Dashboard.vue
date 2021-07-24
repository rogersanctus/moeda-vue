<template>
  <div class="view">
    <div style="display: flex">
      <span>Cambio dos últimos 30 dias:</span>
      <button style="margin-left: auto" @click="updateSeries">Update</button>
    </div>
    <ExchangeRateChart :data="dataSeries" :options="chartOptions"/>
    <!-- Chart -->
    <footer class="footer">RODAPÉ</footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import ExchangeRateChart from '@/components/ExchangeRateChart.vue'
import { ChartData, ChartOptions } from 'chart.js'

export default defineComponent({
  name: 'Dashboard',

  components: {
    ExchangeRateChart
  },

  setup() {
    const labels = ref<Array<string>>([])
    const data = ref<Array<number>>([])

    const dataSeries = computed<ChartData<'line'>>(() => ({
      labels: labels.value,
      datasets: [
        {
          label: 'Dindin',
          data: data.value,
        }
      ]
    }))

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false
    }

    function updateSeries() {
      labels.value = ['A', 'B', 'C']
      data.value = [1, 2, 3]
    }

    return {
      dataSeries,
      chartOptions,
      updateSeries
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
