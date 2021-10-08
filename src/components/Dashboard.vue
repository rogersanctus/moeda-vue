<template>
  <div class="view">
    <LoadingOverlay :loading="loading" />
    <header>
      <h3>Cambio dos últimos 30 dias</h3>
    </header>
    <div class="content">
      <div class="options">
        <div class="input-group">
          <label for="cmp_currency">Converter</label>
          <Autocomplete
            v-model="currency"
            :items="currencySymbols"
            code="code"
            description="description"
          />
        </div>
        <div class="input-group">
          <label for="base_currency">Para</label>
          <Autocomplete
            v-model="currencyBaseSymbol"
            :items="currencySymbols"
            code="code"
            description="description"
          />
        </div>
      </div>
      <div class="chart-wrapper">
        <ExchangeRateChart
          class="chart"
          :data="dataSeries"
          :options="chartOptions"
          @chartCreated="onChartCreated"
        />
      </div>
    </div>
    <footer class="footer"></footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import ExchangeRateChart from '@/components/ExchangeRateChart.vue'
import { Chart, ChartData, ChartOptions } from 'chart.js'
import { CurrencySymbol } from '@t/timeSeries'
import { fetchSeries, fetchSymbols } from '@/services/exchangeRateService'
import LoadingOverlay from './LoadingOverlay.vue'
import Autocomplete from './Autocomplete.vue'

export default defineComponent({
  name: 'Dashboard',

  components: {
    LoadingOverlay,
    ExchangeRateChart,
    Autocomplete
  },

  setup() {
    const loading = ref<boolean>(false)
    const labels = ref<Array<string>>([])
    const data = ref<Array<number>>([])
    const currencySymbols = ref<Array<CurrencySymbol>>([])
    const currencyBaseFallback = 'BRL'
    const currencyBaseSymbol = ref<CurrencySymbol | null>(null)
    const currency = ref<CurrencySymbol | null>(null)

    const gradient = ref<CanvasGradient | string>('#abf7cc')
    const borderColor = ref<string>('#ffaf00')

    const dataSeries = computed<ChartData<'line'>>(() => ({
      labels: labels.value,
      datasets: [
        {
          label: currencyBase.value,
          data: data.value,
          borderColor: borderColor.value,
          backgroundColor: gradient.value,
          fill: 'start'
        }
      ]
    }))

    const currencyBase = computed<string>(
      () => currencyBaseSymbol.value?.code || currencyBaseFallback
    )

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

    watch(currency, fetchSeriesWatcher)
    watch(currencyBaseSymbol, fetchSeriesWatcher)

    function fetchSeriesWatcher(
      newValue: CurrencySymbol | null,
      oldValue: CurrencySymbol | null
    ) {
      if (newValue && newValue.code !== oldValue?.code) {
        doFetchSeries()
      }
    }

    async function doFetchSeries() {
      const toDate = new Date()
      const fromDate = new Date(toDate.valueOf())
      fromDate.setDate(toDate.getDate() - 30)

      try {
        loading.value = true
        const timeseries = await fetchSeries(
          fromDate,
          toDate,
          currency.value?.code || 'USD',
          currencyBase.value
        )

        const labelKeys = Object.keys(timeseries.rates)
        labels.value = labelKeys.map((key) =>
          new Date(key + 'T00:00:00').toLocaleDateString()
        )
        data.value = labelKeys.map(
          (key) => timeseries.rates[key][currencyBase.value] || 0
        )
      } catch (error) {
        console.error('Error while trying to load exchange rate.', error)
      } finally {
        loading.value = false
      }
    }

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

    function onCurrencyBase(modelValue: CurrencySymbol) {
      currencyBaseSymbol.value = modelValue
    }

    loading.value = true
    fetchSymbols()
      .then((resp) => {
        if (resp.success) {
          currencySymbols.value = Object.keys(resp.symbols).map(
            (key) => resp.symbols[key]
          )

          currencyBaseSymbol.value = resp.symbols[currencyBaseFallback]
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
      currencyBaseSymbol,
      currency,
      onChartCreated,
      onCurrencyBase
    }
  }
})
</script>
<style lang="scss" scoped>
.view {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  header {
    display: flex;
    flex-direction: column;
    padding: 15px;
    align-items: center;
    justify-content: space-between;
    background-image: linear-gradient(#1a4b2040, #fff);
  }

  .content {
    display: flex;
    height: 100%;

    .options {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 0.5rem;
      min-width: 330px;
    }

    .input-group {
      width: 100%;
      margin-bottom: 15px;
      min-width: 100%;

      label {
        display: block;
        white-space: nowrap;
        margin-bottom: 0.4rem;
      }

      input {
        width: 100%;
      }
    }

    .chart-wrapper {
      width: 100%;
      height: 100%;
    }
  }

  footer {
    height: 40px;
    min-height: 40px;
    width: 100%;
    background-image: linear-gradient(#fff, #1a4b2040);
  }
}

@media (max-width: 800px) {
  header {
    h3 {
      margin: 0;
    }
  }

  .content {
    flex-direction: column;
    overflow-y: auto;
  }
}
</style>

