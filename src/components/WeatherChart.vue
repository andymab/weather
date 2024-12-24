<template>
    <div>
        <v-tabs v-model="activeTab" bg-color="primary" @click="updateChartOptions">
            <v-tab v-for="(tab, index) in tabList" :key="index">
                {{ tab.caption }}
            </v-tab>
        </v-tabs>

        <div ref="weatherChart" style="height: 400px;" class="mb-4"></div>
    </div>
</template>

<script>

import Highcharts from 'highcharts';
// import highchartsAccessibility from 'highcharts/modules/accessibility';
//import HighchartsReact from 'highcharts-react-official';


import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
//highchartsAccessibility(Highcharts);
export default {
    props: {
        weatherData: {
            type: Array,
            required: true,
        },
        selectedLocations: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            activeTab: 0,
            seriesTemperature: [],
            seriesPressure: [],
            seriesHumidity: [],
            seriesWindSpeed: [],
            chartOptions: {
                title: {
                    text: 'Пример графика',
                },
                series: [],
            },
        };
    },
    watch: {
        weatherData: {
            handler(newData) {
                this.initialData();
            },
            deep: true,

        },
    },
    computed: {
        tabList() {
            if (this.weatherData) {
                return [
                    { caption: 'Температура (°C)', series: this.seriesTemperature, type: 'column' },
                    { caption: 'Ветер (м/с)', series: this.seriesWindSpeed, type: 'spline' },
                    { caption: 'Давление (мм рт. ст.)', series: this.seriesPressure, type: 'spline' },
                    { caption: 'Влажность (%)', series: this.seriesHumidity, type: 'spline' },
                ];
            }
            return [];
        },
    },
    mounted() {

        this.initialData();

    },
    methods: {
        formatDate(dateString) {
            return format(parseISO(dateString), "dd.MM HH:mm", { locale: ru }); // "dd MMMM yyyy HH:mm"
        },
        updateChartOptions() {
            this.chartOptions.title.text = `${this.tabList[this.activeTab].caption} `;
            this.chartOptions.yAxis.title.text = `${this.tabList[this.activeTab].caption}`;
            this.chartOptions.series = this.tabList[this.activeTab].series;
            this.chartOptions.chart.type = this.tabList[this.activeTab].type;
            this.chartOptions.accessibility = { enabled: false };



            this.renderChart();
        },
        renderChart() {
            Highcharts.chart(this.$refs.weatherChart, this.chartOptions);
        },
        formatHpa(hPa) {
                const height = this.selectedLocations[0].heigth;
               
                const barometricStep = 8;
                const pressureChange = height / barometricStep;
                const pressure = parseFloat(((hPa - pressureChange) * 0.75006375541921).toFixed(0));
                return pressure;
            },
        initialData() {
            if (this.weatherData.length === 0) return;

            this.seriesTemperature = [];
            this.seriesPressure = [];
            this.seriesHumidity = [];
            this.seriesWindSpeed = [];

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


            if (this.weatherData.length) {

                this.weatherData.forEach((data, index) => {
                    const seriesTemperature = [];
                    const seriesPressure = [];
                    const seriesHumidity = [];
                    const seriesWindSpeed = [];
                    data.properties.timeseries.forEach(item => {
                        seriesTemperature.push(item.data.instant.details.air_temperature);
                        seriesPressure.push(this.formatHpa(item.data.instant.details.air_pressure_at_sea_level));
                        seriesHumidity.push(item.data.instant.details.relative_humidity);
                        seriesWindSpeed.push(item.data.instant.details.wind_speed);
                    });

                    

                    this.seriesTemperature.push({
                        name: `Температура (°C) - ${this.selectedLocations[index].label}`,
                        data: seriesTemperature,
                    });

                    this.seriesPressure.push({
                        name: `Давление (мм рт. ст.) - ${this.selectedLocations[index].label}`,
                        data: seriesPressure,
                    });



                    this.seriesHumidity.push({
                        name: `Влажность (%) - ${this.selectedLocations[index].label}`,

                        data: seriesHumidity,
                    });

                    this.seriesWindSpeed.push({
                        name: `Ветер (м/с) - ${this.selectedLocations[index].label}`,

                        data: seriesWindSpeed,
                    });


                });

            }

            this.chartOptions = {
                chart: {
                    type: this.tabList[this.activeTab].type,
                },
                title: {
                    text: this.tabList[this.activeTab].caption,
                },
                xAxis: {
                    categories: categories,
                    plotLines
                },
                yAxis: {
                    title: {
                        text: this.tabList[this.activeTab].caption,
                    },
                },
                series: [],


            };
            this.updateChartOptions();

        },
    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>