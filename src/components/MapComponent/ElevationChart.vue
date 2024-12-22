<template>
    <div>
        <div  class="my-2">
            <v-alert :text="textdistance" type="info"></v-alert>
        </div>
        <div  class="mb-2">
            <v-alert :text="textelevation" type="warning"></v-alert>
        </div>
        <div ref="containerheights" class="elevations"> </div>
        <!-- <v-chart :data="elevationData"></v-chart> -->
    </div>
</template>

<script>

    import Highcharts from 'highcharts';

    export default {
        name: "ElevationChart",
        props: {
            textdistance:{ type: String, required: true },
            textelevation:{ type: String, required: true },
            route: {
                type: Array,
                required: true
            },
            elevationData: {
                type: Array,
                required: true
            }
        },
        mounted() {
            this.initializeChart();
            this.addChartEvents();
            this.plotElevationProfile();
        },
        data() {
            return {
                chart: null,
            };
        },
        watch: {
            elevationData(newselectMode) {
                this.plotElevationProfile();
            }, 
        },
        methods: {
            initializeChart() {
                this.chart = Highcharts.chart(this.$refs.containerheights, {
                    chart: {
                        type: 'line',
                    },
                    legend: {
                        enabled: false // Отключаем легенду
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        title: { text: '' },
                        categories: ['1', '4', '12'] // Изначально пустой массив категорий
                    },
                    yAxis: {
                        title: { text: '' }
                    },
                    tooltip: {
                        formatter: function () {
                            return `
              Высота: ${this.y} м<br>
              Расстояние (пройдено): ${this.point.distance} <br>
              Время (пройдено): ${this.point.duration} `;
                        }
                    },
                    series: [{
                        name: 'Высота',
                        data: [1, 4, 12] // Изначально пустой массив данных
                    }]
                });



            },
            addChartEvents() {
                // Добавляем событие клика по контейнеру графика
                Highcharts.addEvent(this.chart.container, 'click', (e) => {
                    e = this.chart.pointer.normalize(e); // Нормализуем координаты события
                    console.log(`index ${e.point.index}`);
                    // console.log(`Clicked chart at ${e.chartX}, ${e.chartY}`);
                    this.$emit('addTrackMarker', this.route[e.point.index]);
                });

            },

            plotElevationProfile() {  ///подготовка к постороению графика высот
                this.chart.xAxis[0].setCategories(this.route.map((_, index) => `${index + 1}`), false); // Обновляем категории
                this.chart.series[0].setData(this.elevationData, true); // Обновляем данные и перерисовываем график
            },


        },
    }
</script>
<style>
    .highcharts-credits {
        opacity: 0;
    }
</style>
<style scoped>
       .elevations {
        max-height: 240px;
        /* position: absolute;
        right: 0;
        bottom: 0;
        z-index: 2000;
        height: 200px; */
    }
</style>