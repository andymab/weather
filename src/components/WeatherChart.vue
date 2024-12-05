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
        selectedLocations: {
            type: Array,
            required: true,
        },
        title:{
            type: String,
            required: true,
        },
    },
    watch: {
        weatherData: {
            handler(newData) {
                this.renderChart();
            },
                deep: true,
      
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

            let categories = [];

            if (this.weatherData.length) {
                categories = this.weatherData[0].properties.timeseries.map(item => this.formatDate(item.time));
            }

            const seriesData = [];
            if (this.weatherData.length) {
                this.weatherData.forEach((data, index) => {
                    const seriesTemperature = [];
                    const seriesPressure = [];
                    const seriesHumidity = [];
                    const seriesWindSpeed = [];

                    data.properties.timeseries.forEach(item => {
                        seriesTemperature.push(item.data.instant.details.air_temperature);
                        seriesPressure.push(item.data.instant.details.air_pressure_at_sea_level);
                        seriesHumidity.push(item.data.instant.details.relative_humidity);
                        seriesWindSpeed.push(item.data.instant.details.wind_speed);
                    });

                    seriesData.push({
                        name: `${this.title} - ${this.selectedLocations[index].label}`,
                        data: seriesTemperature,
                    });

                });
            }


            Highcharts.chart(this.$refs.weatherChart, {
                chart: {
                    type: 'column',
                },
                title: {
                    text: this.title,
                },
                xAxis: {
                    categories: categories, //['Температура (°C)', 'Давление (hPa)', 'Влажность (%)', 'Скорость ветра (m/s)'],
                },
                yAxis: {
                    title: {
                        text: this.title,
                    },
                },
                series: seriesData,
            });
        },
    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>