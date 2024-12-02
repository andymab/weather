<template>
    <div>
        <div ref="weatherChart" style="height: 400px;"></div>
    </div>
</template>

<script>

import Highcharts from 'highcharts';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
    props: {
        weatherData: {
            type: Array,
            required: true,
        },
    },
    watch: {
        weatherData(newData,oldData) {
            if (newData !== oldData) {
                this.renderChart();
            }
        },
    },
    mounted() {
        this.renderChart();
    },
    methods: {
        formatDate(dateString) {
            return format(parseISO(dateString), "dd MMMM yyyy HH:mm", { locale: ru });
        },
        renderChart() {
            if (this.weatherData.length === 0) return;


            const temperature = [];
            const pressure = [];
            const humidity = [];
            const windSpeed = [];


            this.weatherData.properties.timeseries.forEach(item => {
                temperature.push(item.data.instant.details.air_temperature);
                pressure.push(item.data.instant.details.air_pressure_at_sea_level);
                humidity.push(item.data.instant.details.relative_humidity);
                windSpeed.push(item.data.instant.details.wind_speed);
            });

            const categories = this.weatherData.properties.timeseries.map(item => this.formatDate(item.time));

            console.log('categories', categories, 'temperature', temperature, 'pressure', pressure, 'humidity', humidity, 'windSpeed', windSpeed);


            Highcharts.chart(this.$refs.weatherChart, {
                chart: {
                    type: 'column',
                },
                title: {
                    text: 'Погодные условия',
                },
                xAxis: {
                    categories: categories, //['Температура (°C)', 'Давление (hPa)', 'Влажность (%)', 'Скорость ветра (m/s)'],
                },
                yAxis: {
                    title: {
                        text: 'Значение',
                    },
                },
                series: [{
                    name: 'Температура (°C)',
                    data: temperature,
                },
                    // , {
                    //     name: 'Давление (hPa)',
                    //     data: pressure,
                    // }, {
                    //     name: 'Влажность (%)',
                    //     data: humidity,
                    // }, {
                    //     name: 'Скорость ветра (m/s)',
                    //     data: windSpeed,
                    // },
                ],
            });
        },
    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>