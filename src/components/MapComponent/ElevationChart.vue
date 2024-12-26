<template>
    <div>
        <div class="my-2" v-if="textdistance">
            <v-alert :text="textdistance" type="info"></v-alert>
        </div>
        <div class="mb-2" v-if="textelevation">
            <v-alert :text="textelevation" type="warning"></v-alert>
        </div>
        <v-icon @click="toggleFullScreen" v-tooltip.bottom="!isdisplayFull ? 'Раскрыть на весь экран' : 'свернуть'"
            class="ma-2">
            {{ !isdisplayFull ? 'mdi-aspect-ratio' : 'mdi-resize' }}
        </v-icon>

        <div ref="containerheights" class="elevations"> </div>

        <div v-if="isFullScreen" class="full-screen-container">
            <div ref="fullScreenContainer" class="full-screen-elevations"></div>
            <v-icon @click="toggleFullScreen" class="close-icon" v-tooltip.bottom="'Свернуть'">
                mdi-resize
            </v-icon>
        </div>

    </div>
</template>

<script>

import Highcharts from 'highcharts';

export default {
    name: "ElevationChart",
    props: {
        textdistance: { type: String, required: true },
        textelevation: { type: String, required: true },
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
        this.addChartEvents(this.chart.container);
        this.plotElevationProfile();
    },
    data() {
        return {
            chart: null,
            fullScreenChart: null,
            isFullScreen: false,
            dialog: false,
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
                    type: 'area',
                },
                legend: {
                    enabled: false // Отключаем легенду
                },
                title: {
                    text: ''
                },
                xAxis: {
                    title: { text: '' },
                    categories: ['1', '4', '12'], // Изначально пустой массив категорий
                    gridLineWidth: 1
                },
                yAxis: {
                    title: { text: '' },
                    gridLineWidth: 1,
                    min: 0,
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
                    data: [1, 4, 12], // Изначально пустой массив данных
                    zones: [{
                        color: '#FFCC80'
                    }],
                }]
            });
        },
        addChartEvents(container) {
            // Добавляем событие клика по контейнеру графика
            Highcharts.addEvent(container, 'click', (e) => {
                e = this.chart.pointer.normalize(e); // Нормализуем координаты события
                // console.log(`index ${e.point.index}`);
               // console.log(`Clicked chart at , ${e.chartY}`,e);
                this.$emit('addTrackMarker', this.route[e.point.index],`${e.point.y}м <br/> Пройдено ${e.point.distance} <br/> Время ${e.point.duration}`);
            });
        },

        plotElevationProfile() {  ///подготовка к постороению графика высот
            const firstValue = this.elevationData.length > 0 ? Math.min(...this.elevationData.map(point => point.y)) : 0;
            this.chart.yAxis[0].update({ min: firstValue }, false);
            this.chart.xAxis[0].setCategories(this.route.map((_, index) => `${index + 1}`), false); // Обновляем категории
            this.chart.series[0].setData(this.elevationData, true); // Обновляем данные и перерисовываем график
        },

        toggleFullScreen() {
            this.isdisplayFull = !this.isdisplayFull;
            if (this.isdisplayFull) {
                this.isFullScreen = true; // Открываем диалог
                this.$nextTick(() => {
                    this.initializeFullScreenChart();
                });
            } else {
                this.isFullScreen = false; // Закрываем диалог
            }
        },
        initializeFullScreenChart() {
            // Уничтожаем предыдущий график, если он существует
            if (this.fullScreenChart) {
                this.fullScreenChart.destroy();
            }
            const firstValue = this.elevationData.length > 0 ? Math.min(...this.elevationData.map(point => point.y)) : 0;

            this.fullScreenChart = Highcharts.chart(this.$refs.fullScreenContainer, {
                chart: {
                    type: 'area',
                    backgroundColor: '#f4f4f4', // Цвет фона графика
                },
                legend: {
                    enabled: false,
                },
                title: {
                    text: '',
                },
                xAxis: {
                    title: { text: '' },
                    categories: this.route.map((_, index) => `${index + 1}`),
                    gridLineWidth: 1,
                },
                yAxis: {
                    title: { text: '' },
                    min: firstValue,
                    gridLineWidth: 1,
                },
                tooltip: {
                    formatter: function () {
                        return `
                            Высота: ${this.y} м<br>
                            Расстояние (пройдено): ${this.point.distance}<br>
                            Время (пройдено): ${this.point.duration}`;
                    },
                },
                series: [{
                    name: 'Высота',
                    data: this.elevationData,
                    zones: [{
                        color: '#FFCC80'
                    }],
                }],
            });


            this.addChartEvents(this.fullScreenChart.container);
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

}

.full-screen-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    /* Высота графика в полноэкранном режиме */
    background-color: white;
    /* Цвет фона */
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    /* Убедитесь, что он выше других элементов */
}

.full-screen-elevations {
    width: 100%;
    height: 100%;
    /* Высота графика в полноэкранном режиме */
}

.close-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
}
</style>