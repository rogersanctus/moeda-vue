<template>
  <div class="view">
    <div v-if="loading">Carregando...</div>
    <div class="top">
      <span>Cambio dos últimos 30 dias:</span>
      <div style="display: flex; align-items: center">
        <label
          for="cmp_currency"
          style="white-space: nowrap; margin-right: 15px"
          >Comparar com:</label
        >
        <Autocomplete
          v-model="currency"
          :items="currencySymbols"
          code="code"
          description="description"
        />
      </div>
    </div>
    <ExchangeRateChart
      :data="dataSeries"
      :options="chartOptions"
      @chartCreated="onChartCreated"
    />
    <!-- Chart -->
    <footer class="footer">RODAPÉ</footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import ExchangeRateChart from '@/components/ExchangeRateChart.vue'
import { Chart, ChartData, ChartOptions } from 'chart.js'
import { CurrencySymbol } from '@t/timeSeries'
import { fetchSeries, fetchSymbols } from '@/services/exchangeRateService'
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

    const gradient = ref<CanvasGradient | string>('#abf7cc')
    const borderColor = ref<string>('#ffaf00')

    const dataSeries = computed<ChartData<'line'>>(() => ({
      labels: labels.value,
      datasets: [
        {
          label: 'BRL',
          data: data.value,
          borderColor: borderColor.value,
          backgroundColor: gradient.value,
          fill: 'start'
        }
      ]
    }))

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        filler: {
          propagate: true
        },
        decimation: {
          enabled: true
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const currencyValue = context.parsed.y
              const digits = currency.value?.code === 'USD' ? 2 : undefined

              return Intl.NumberFormat(undefined, {
                style: 'decimal',
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
              }).format(currencyValue)
            }
          }
        }
      },
      interaction: {
        intersect: true,
        axis: 'y',
        mode: 'nearest'
      }
    }

    watch(currency, async (value, old) => {
      if (value && value.code !== old?.code) {
        const toDate = new Date()
        const fromDate = new Date(toDate.valueOf())
        fromDate.setDate(toDate.getDate() - 30)

        try {
          loading.value = true
          const timeseries = await fetchSeries(
            fromDate,
            toDate,
            value?.code,
            'BRL'
          )

          const labelKeys = Object.keys(timeseries.rates)
          labels.value = labelKeys.map((key) =>
            new Date(key + 'T00:00:00').toLocaleDateString()
          )
          data.value = labelKeys.map((key) => timeseries.rates[key]['BRL'] || 0)
        } catch (error) {
          console.error('Error while trying to load exchange rate.', error)
        } finally {
          loading.value = false
        }
      }
    })

    function onChartCreated(chart: Chart<'line'>) {
      const grad = chart.ctx.createLinearGradient(
        0,
        0,
        0,
        chart.chartArea.height
      )
      grad.addColorStop(0, '#50f00080')
      grad.addColorStop(0.5, '#7ccf5580')
      grad.addColorStop(0.75, '#ffffff50')
      grad.addColorStop(1, '#ffffff40')
      gradient.value = grad
    }

    loading.value = true
    fetchSymbols()
      .then((resp) => {
        if (resp.success) {
          currencySymbols.value = Object.keys(resp.symbols).map(
            (key) => resp.symbols[key]
          )
          currency.value = resp.symbols['USD']
        }
      })
      .catch((error) => console.error(error))
      .finally(() => (loading.value = false))

    return {
      loading,
      dataSeries,
      chartOptions,
      currencySymbols,
      currency,
      onChartCreated
    }
  }
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
