<template>
    <div>
        <div ref="weatherChart" style="height: 400px;" class="mb-4"></div>
    </div>
    <div>
        <div ref="windSpeedChart" style="height: 300px;" class="mb-4"></div>
    </div>
    <div>
        <div ref="PressureChart" style="height:700px;" class="mb-4"></div>
    </div>
    <div>
        <div ref="HumidityChart" style="height:700px;" class="mb-4"></div>
    </div>

    <highcharts :options="chartOptions" ref="chart" ></highcharts>


    <v-card v-if="isCardVisible" class="info-card" :style="{ top: cardPosition.y + 'px', left: cardPosition.x + 'px' }">
        <v-card-title>{{ cardData.title }}</v-card-title>
        <v-card-text>{{ cardData.info }}</v-card-text>
    </v-card>

</template>

<script>

import Highcharts from 'highcharts';
import { Chart } from 'highcharts-vue';


import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
    components: {
        highcharts: Chart,
    },
    props: {
        weatherData: {
            type: Array,
            required: true,
        },
        selectedLocations: {
            type: Array,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            isCardVisible: false,
            cardPosition: { x: 0, y: 0 },
            cardData: { title: '', info: '' },

        };
    },
    watch: {
        weatherData: {
            handler(newData) {
                this.renderChart();
            },
            deep: true,

        },
    },
    computed: {
        chartOptions() {
            const self = this;
            return {
                chart: {
                    type: 'line',
                    events: {
                        load() {
                            // Здесь можно добавить начальные данные
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    useHTML: true
                },
                series: [{
                    data: [
                        { x: Date.UTC(2024, 0, 1), y: 29.9, title: 'Point 1', info: 'Info about Point 1' },
                        { x: Date.UTC(2024, 0, 2), y: 71.5, title: 'Point 2', info: 'Info about Point 2' },
                        { x: Date.UTC(2024, 0, 3), y: 106.4, title: 'Point 3', info: 'Info about Point 3' }
                    ],
                    point: {
                        events: {
                            mouseOver: function (event) {
                                self.showCard(event, this);
                            }
                        }
                    }
                }],
                tooltip: { enabled: true } // Отключаем стандартный tooltip

            };
        },
    },
    mounted() {

        this.renderChart();

    },
    methods: {
        showCard(event, ttt) {
            console.log('event',event,'ttt.clientX',ttt.plotY);
            const point = event.target;
            this.cardData.title = point.point.title; // Получаем заголовок из данных точки
            console.log('event.chartX',event.chartX);

            this.cardData.info = point.point.info; // Получаем информацию из данных точки
            this.cardPosition.x = event.clientX + 10; // Позиция по X
            this.cardPosition.y = event.clientY - 30; // Позиция по Y
            this.isCardVisible = true; // Показываем карточку
        },
        hideCard() {
            this.isCardVisible = false; // Скрываем карточку
        },
        formatDate(dateString) {
            return format(parseISO(dateString), "dd.MM HH:mm", { locale: ru }); // "dd MMMM yyyy HH:mm"
        },
        renderChart() {
            if (this.weatherData.length === 0) return;

            // const temperature = [];
            // const pressure = [];
            // const humidity = [];
            // const windSpeed = [];


            const timeseries = this.weatherData[0].properties.timeseries;
            const categories = timeseries.map(item => this.formatDate(item.time));
            const plotLines = categories.map((item, index) => {
                if (index === 0) return;
                const date = item.split('.')[0];
                const olddate = categories[index - 1].split('.')[0];
                if (date !== olddate) {
                    return {
                        color: '#FF0000',
                        value: index,
                        width: 1,
                        label: {
                            text: date,
                            align: 'center',
                            verticalAlign: 'top',
                            style: {
                                color: '#FF0000',
                            },
                        },
                    };
                } else {
                    return;
                }

            }).filter(line => line !== undefined);;


            const seriesData = [];
            const seriesDataWindSpeed = [];
            const seriesDataPressure = [];
            const seriesDataHumidity = [];

            this.weatherData.forEach((data, index) => {
                const seriesTemperature = [];
                const seriesPressure = [];
                const seriesHumidity = [];
                const seriesWindSpeed = [];

                data.properties.timeseries.forEach(item => {
                    seriesTemperature.push(item.data.instant.details.air_temperature);
                    seriesPressure.push((item.data.instant.details.air_pressure_at_sea_level * 0.750062));
                    seriesHumidity.push(item.data.instant.details.relative_humidity);
                    seriesWindSpeed.push(item.data.instant.details.wind_speed);
                });

                seriesData.push({
                    name: `${this.title} - ${this.selectedLocations[index].label}`,
                    data: seriesTemperature,
                });

                seriesDataWindSpeed.push({
                    name: `Ветер (м/с) - ${this.selectedLocations[index].label}`,
                    data: seriesWindSpeed,
                });

                seriesDataPressure.push({
                    name: `Давление (мм/рст) - ${this.selectedLocations[index].label}`,
                    data: seriesPressure,
                });
                seriesDataHumidity.push({
                    name: `Влажность (%) - ${this.selectedLocations[index].label}`,
                    data: seriesHumidity,
                });
            });




            Highcharts.chart(this.$refs.weatherChart, {
                chart: {
                    type: 'column',
                },
                title: {
                    text: this.title,
                },
                xAxis: {
                    categories: categories,
                    plotLines



                },
                yAxis: {
                    title: {
                        text: this.title,
                    },
                },
                series: seriesData,
            });

            Highcharts.chart(this.$refs.windSpeedChart, {
                chart: {
                    type: 'line',
                },
                title: {
                    text: 'Ветер (м/с)',
                },
                xAxis: {
                    categories: categories,
                    plotLines



                },
                yAxis: {
                    title: {
                        text: 'Ветер (м/с)',
                    },
                },
                series: seriesDataWindSpeed,
            });

            Highcharts.chart(this.$refs.PressureChart, {
                chart: {
                    type: 'line',
                },
                title: {
                    text: 'Давление (мм/рст)',
                },
                xAxis: {
                    categories: categories,
                    plotLines
                },
                yAxis: {
                    title: {
                        text: 'Давление (мм/рст)',
                    },
                },
                series: seriesDataPressure,
            });

            Highcharts.chart(this.$refs.HumidityChart, {
                chart: {
                    type: 'line',
                },
                title: {
                    text: 'Влажность (%)',
                },
                xAxis: {
                    categories: categories,
                    plotLines
                },
                yAxis: {
                    title: {
                        text: 'Влажность (%)',
                    },
                },
                series: seriesDataHumidity,
            });

        },
    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>