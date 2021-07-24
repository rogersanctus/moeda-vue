<template>
  <div class="chart-container" style="position: relative">
      <canvas ref="chartCanvas" height="auto"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted, PropType, ref, watch } from "vue"
import { Chart, ChartData, ChartOptions, LineController, LineElement, PointElement, CategoryScale, LinearScale} from 'chart.js'

Chart.register([LineController, LineElement, PointElement, CategoryScale, LinearScale])

export default defineComponent({
    name: 'ExchangeRateChart',
    props: {
        data: {
            type: Object as PropType<ChartData<'line'>>,
            required: true
        },
        options: {
            type: Object as PropType<ChartOptions<'line'>>,
            required: false,
            default: () => ({})
        }
    },

    setup(props) {
        const chartCanvas = ref<HTMLCanvasElement | null>(null)
        let chart: Chart<'line'> | null = null

        function render() {
            if(chartCanvas.value) {
                chart = new Chart<'line'>(chartCanvas.value, {
                    type: 'line',
                    data: props.data,
                    options: props.options
                })
            }
        }

        watch(() => props.data, (data) => {
            if(chart) {
                chart.data = data
                chart.update()
            }
        })

        watch(() => props.options, (options) => {
            if(chart) {
                chart.options = options
                chart.update()
            }
        })

        onBeforeMount(() => {
            if(chart !== null) {
                chart.destroy()
                chart = null
            }
        })

        onMounted(() => render())

        return {
            chartCanvas
        }
    }
})
</script>

<style lang="scss">
.chart-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}
</style>
