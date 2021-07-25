<template>
  <div class="view">
    <div v-if="loading">Carregando...</div>
    <div class="top">
      <span>Cambio dos últimos 30 dias:</span>
      <div style="display: flex; align-items: center;">
        <label for="cmp_currency" style="white-space: nowrap; margin-right: 15px;">Comparar com:</label>
        <Autocomplete v-model="currency" :items="currencySymbols" :description="'description'"/>
      </div>
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
import { CurrencySymbol } from '@t/timeSeries'
import { fetchSymbols } from '@/services/exchangeRateService'
import Autocomplete from './Autocomplete.vue'

export default defineComponent({
  name: 'Dashboard',

  components: {
    ExchangeRateChart,
    Autocomplete
  },

  setup() {
    const loading = ref<boolean>(false)
    const labels = ref<Array<string>>([])
    const data = ref<Array<number>>([])
    const currencySymbols = ref<Array<CurrencySymbol>>([])
    const currency = ref<CurrencySymbol | null>(null)

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

    loading.value = true
    fetchSymbols()
    .then((resp) => {
      if(resp.success) {
        currencySymbols.value = Object.keys(resp.symbols).map((key) => resp.symbols[key])
        currency.value = resp.symbols['USD']
      }
    })
    .catch((error) => console.error(error))
    .finally(() => loading.value = false)

    return {
      loading,
      dataSeries,
      chartOptions,
      currencySymbols,
      currency,
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

  .top {
    display: flex;
    padding: 15px;
    padding-right: 300px;

    align-items: center;
    justify-content: space-between;
  }

  footer {
    margin-top: auto;
  }
}
</style>
